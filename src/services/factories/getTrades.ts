import Web3 from 'web3'
import { ExchangeApi, Trade, Order } from 'api/exchange/ExchangeApi'
import { getTokensFactory } from 'services/factories/tokenList'
import { dateToBatchId } from 'utils'
import { TokenDetails, calculatePrice } from '@gnosis.pm/dex-js'

interface GetTradesParams {
  networkId: number
  userAddress: string
  fromBlock?: number
}

export function getTradesFactory(factoryParams: {
  web3: Web3
  exchangeApi: ExchangeApi
  getTokens: ReturnType<typeof getTokensFactory>
}): (params: GetTradesParams) => Promise<Trade[]> {
  const { web3, exchangeApi, getTokens } = factoryParams

  const nextFromBlock: { [networkId: number]: number } = {}

  async function getBlockTimePair(blockNumber: number): Promise<[number, number]> {
    return [blockNumber, +(await web3.eth.getBlock(blockNumber)).timestamp]
  }

  async function getOrderPair(userAddress: string, networkId: number, orderId: string): Promise<[string, Order]> {
    return [orderId, await exchangeApi.getOrder({ userAddress, networkId, orderId })]
  }

  async function getTrades(params: GetTradesParams): Promise<Trade[]> {
    const { userAddress, networkId } = params
    const fromBlock = params.fromBlock ?? nextFromBlock[params.networkId]

    const [tradeEvents, currentBlock] = await Promise.all([
      exchangeApi.getPastTrades({ ...params, fromBlock }),
      web3.eth.getBlock('latest'),
    ])
    // set latest block to start from there next time, if no `fromBlock` is provided
    nextFromBlock[networkId] = currentBlock.number

    // Minor optimization: return early when empty
    if (tradeEvents.length === 0) {
      return []
    }

    const blocksSet = new Set<number>()
    const orderIdsSet = new Set<string>()
    const tokenIdsSet = new Set<number>()

    tradeEvents.forEach(event => {
      blocksSet.add(event.blockNumber)
      orderIdsSet.add(event.orderId)
      tokenIdsSet.add(event.buyTokenId)
      tokenIdsSet.add(event.sellTokenId)
    })

    // TODO: maybe combine both promise lists into 1?
    const blockTimes = new Map<number, number>(await Promise.all(Array.from(blocksSet).map(getBlockTimePair)))
    // TODO: we probably already have this info in global state and don't need to fetch from the contract again?
    const orders = new Map<string, Order>(
      await Promise.all(Array.from(orderIdsSet).map(orderId => getOrderPair(userAddress, networkId, orderId))),
    )
    // TODO: list might not be up to date. Handle case where possibly tokens are not found
    // In that case, what to do? retry? get token from contract directly? use the `add to local list` functionality?
    const tokens = new Map(
      getTokens(networkId)
        .filter(token => tokenIdsSet.has(token.id))
        .map(token => [token.id, token]),
    )

    const trades = tradeEvents.reduce<Trade[]>((acc, event) => {
      const timestamp = (blockTimes.get(event.blockNumber) as number) * 1000
      const batchId = dateToBatchId(timestamp)
      // TODO: this might be empty
      const buyToken = tokens.get(event.buyTokenId) as TokenDetails
      const sellToken = tokens.get(event.sellTokenId) as TokenDetails

      const order = orders.get(event.orderId) as Order

      const trade: Trade = {
        ...event,
        batchId,
        timestamp,
        hashKey: event.orderId + batchId,
        buyToken,
        sellToken,
        limitPrice: calculatePrice({
          numerator: { amount: order.priceNumerator, decimals: buyToken.decimals },
          denominator: { amount: order.priceDenominator, decimals: sellToken.decimals },
        }),
        fillPrice: calculatePrice({
          numerator: { amount: event.buyAmount, decimals: buyToken.decimals },
          denominator: { amount: event.sellAmount, decimals: sellToken.decimals },
        }),
        remainingAmount: order.priceDenominator.sub(event.sellAmount),
      }
      acc.push(trade)

      return acc
    }, [])

    return trades
  }

  return getTrades
}
