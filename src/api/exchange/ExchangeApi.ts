import BN from 'bn.js'
import { Subscription } from 'web3-core-subscriptions'
import { PastEventOptions } from 'web3-eth-contract'

import { assert, BatchExchangeEvents, TokenDetails } from '@gnosis.pm/dex-js'

import { DepositApiImpl, DepositApi, DepositApiDependencies } from 'api/deposit/DepositApi'
import { Receipt, WithTxOptionalParams } from 'types'
import { logDebug } from 'utils'
import { decodeAuctionElements, decodeOrder } from './utils/decodeAuctionElements'
import { DEFAULT_ORDERS_PAGE_SIZE } from 'const'
import BigNumber from 'bignumber.js'

interface BaseParams {
  networkId: number
}

export interface GetOrdersParams extends BaseParams {
  userAddress: string
}

export interface GetOrderParams extends GetOrdersParams {
  orderId: string
}

export interface GetOrderFromOrderPlacementEventParams extends GetOrderParams {
  buyTokenId?: number | string
  sellTokenId?: number | string
  toBlock?: number
}

export interface GetOrdersPaginatedParams extends GetOrdersParams {
  offset: number
  pageSize?: number
}

export interface GetTokenAddressByIdParams extends BaseParams {
  tokenId: number
}

export interface GetTokenIdByAddressParams extends BaseParams {
  tokenAddress: string
}

export type HasTokenParams = GetTokenIdByAddressParams

export interface PastEventsParams extends GetOrdersParams {
  fromBlock?: number
  toBlock?: number | string
}

export interface SubscriptionParams extends GetOrdersParams {
  callback: (trade: BaseTradeEvent) => void
}

export interface AddTokenParams extends BaseParams, WithTxOptionalParams {
  userAddress: string
  tokenAddress: string
}

export interface PlaceOrderParams extends BaseParams, WithTxOptionalParams {
  userAddress: string
  buyTokenId: number
  sellTokenId: number
  validUntil: number
  buyAmount: BN
  sellAmount: BN
}

export interface PlaceValidFromOrdersParams extends BaseParams, WithTxOptionalParams {
  userAddress: string
  buyTokens: number[]
  sellTokens: number[]
  validFroms: number[]
  validUntils: number[]
  buyAmounts: BN[]
  sellAmounts: BN[]
}

export interface CancelOrdersParams extends BaseParams, WithTxOptionalParams {
  userAddress: string
  orderIds: number[]
}

export interface PendingTxObj extends AuctionElement {
  txHash: string
}

export interface ExchangeApi extends DepositApi {
  getNumTokens(networkId: number): Promise<number>
  getFeeDenominator(networkId: number): Promise<number>

  getOrder(params: GetOrderParams): Promise<Order>
  getOrderFromOrderPlacementEvent(params: GetOrderFromOrderPlacementEventParams): Promise<Order>
  getOrders(params: GetOrdersParams): Promise<AuctionElement[]>
  getOrdersPaginated(params: GetOrdersPaginatedParams): Promise<GetOrdersPaginatedResult>

  getTokenAddressById(params: GetTokenAddressByIdParams): Promise<string> // tokenAddressToIdMap
  getTokenIdByAddress(params: GetTokenIdByAddressParams): Promise<number>
  hasToken(params: HasTokenParams): Promise<boolean>

  // event related
  getPastTrades(params: PastEventsParams): Promise<BaseTradeEvent[]>
  subscribeToTradeEvent(params: SubscriptionParams): Promise<() => void>
  unsubscribeToTradeEvent(): void

  addToken(params: AddTokenParams): Promise<Receipt>
  placeOrder(params: PlaceOrderParams): Promise<Receipt>
  placeValidFromOrders(params: PlaceValidFromOrdersParams): Promise<Receipt>
  cancelOrders(params: CancelOrdersParams): Promise<Receipt>
}

export interface AuctionElement extends Order {
  user: string
  sellTokenBalance: BN
  id: string // string because we might need natural ids
}

export interface Order {
  buyTokenId: number
  sellTokenId: number
  validFrom: number
  validUntil: number
  priceNumerator: BN
  priceDenominator: BN
  remainingAmount: BN
}

/**
 * BaseTradeEvent uses only info available on the emitted Trade event
 */
export interface BaseTradeEvent {
  // order related
  orderId: string
  sellTokenId: number
  buyTokenId: number
  sellAmount: BN
  buyAmount: BN
  // block related
  txHash: string
  eventIndex: number
  blockNumber: number
  id: string // txHash | eventIndex
}

/**
 * Trade enriches BaseTradeEvent with block, order and token data
 */
export interface Trade extends BaseTradeEvent {
  batchId: number
  revertKey: string // batchId | orderId, to find reverts
  // indexOnBatch: number // tracks trade position on batch, in case of reverts
  timestamp: number
  settlingTimestamp: number
  buyToken: TokenDetails
  sellToken: TokenDetails
  limitPrice: BigNumber
  fillPrice: BigNumber
  remainingAmount: BN
}

export interface GetOrdersPaginatedResult {
  orders: AuctionElement[]
  nextIndex?: number
}

// TODO: move to const/config
const CONTRACT_DEPLOYMENT_BLOCK = {
  1: 9340147,
  4: 5844678,
}

type TradeEvent = BatchExchangeEvents['Trade']
type TradeSubscription = Subscription<TradeEvent>

interface Subscriptions {
  trade: { [networkId: number]: TradeSubscription }
}
/**
 * Basic implementation of Stable Coin Converter API
 */
export class ExchangeApiImpl extends DepositApiImpl implements ExchangeApi {
  private subscriptions: Subscriptions = { trade: {} }

  public constructor(injectedDependencies: DepositApiDependencies) {
    super(injectedDependencies)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).exchange = this._contractPrototype
  }

  // TODO: Not very happy with this method. Can't be used inside the class because batchId is only known with block data
  // TODO: Don't really know where to put it
  public static buildTradeRevertKey(batchId: number, orderId: string): string {
    return batchId + '|' + orderId
  }

  public async getPastTrades({
    userAddress,
    networkId,
    fromBlock: _fromBlock,
    toBlock: _toBlock,
  }: PastEventsParams): Promise<BaseTradeEvent[]> {
    const contract = await this._getContract(networkId)

    // Optionally fetch events from a given block.
    // Could be used to fetch from 0 (although, why?) OR
    // pagination of sorts OR
    // updating trades based on polling
    const fromBlock = _fromBlock ?? CONTRACT_DEPLOYMENT_BLOCK[networkId]

    // Optionally fetch events until a given block.
    // Defaults to 'latest'
    const toBlock = _toBlock ?? 'latest'

    const tradeEvents = await this.safeGetEvents(options => contract.getPastEvents('Trade', options), {
      filter: { owner: userAddress },
      fromBlock,
      toBlock,
    })

    logDebug(
      `[ExchangeApiImpl] Fetched ${
        tradeEvents.length
      } trades for address ${userAddress} on network ${networkId} from block ${fromBlock} ${
        toBlock ? `to block ${toBlock}` : ''
      }`,
    )

    return tradeEvents.filter(event => !event['removed']).map(this.parseTradeEvent)
  }

  private async safeGetEvents<T>(
    fn: (options: PastEventOptions) => Promise<T[]>,
    options: PastEventOptions,
  ): Promise<T[]> {
    try {
      return await fn(options)
    } catch (e) {
      // Error `-32005` means too many results in range.
      // Let's split it up into 2 smaller requests
      if (e.code === -32005) {
        const { fromBlock: _fromBlock, toBlock: _toBlock } = options
        logDebug(`[ExchangeApiImpl] Request range was too big [${_fromBlock} to ${_toBlock}]. Splitting up`)

        const fromBlock =
          _fromBlock === undefined
            ? 0
            : typeof _fromBlock === 'string'
            ? (await this.web3.eth.getBlock(_fromBlock)).number
            : _fromBlock

        const toBlock =
          _toBlock === undefined
            ? await this.web3.eth.getBlockNumber()
            : typeof _toBlock === 'string'
            ? (await this.web3.eth.getBlock(_toBlock)).number
            : _toBlock

        // If we don't have numbers by now, something is not right, let it bubble up.
        // Not gonna do this fully generic because we don't need it (yet, at least)
        if (typeof fromBlock === 'number' && typeof toBlock === 'number') {
          const currRange = toBlock - fromBlock

          // if we are already querying for a single block and there are too many events, splitting the requests won't help
          if (currRange > 1) {
            const nextRange = Math.floor(Math.max(currRange / 2, 1))
            const events = await this.safeGetEvents(fn, { ...options, toBlock: fromBlock + nextRange })
            return events.concat(await this.safeGetEvents(fn, { ...options, fromBlock: fromBlock + nextRange + 1 }))
          }
        }
      }
      // Anything else: don't care, re-throw
      throw e
    }
  }

  public async subscribeToTradeEvent(params: SubscriptionParams): Promise<() => void> {
    const { userAddress, networkId, callback } = params

    // Remove any active subscription
    this.unsubscribeToTradeEvent()

    logDebug(`[ExchangeApiImpl] subscribing to trade events for address ${userAddress} and networkId ${networkId}`)

    const subscription = await this.getTradeSubscription(params)

    subscription
      .on('data', event => callback(this.parseTradeEvent(event)))
      .on('error', error => {
        console.error(
          `[ExchangeApiImpl] Failed to receive Trade event for address ${userAddress} on network ${networkId}: ${error}`,
        )
      })

    return (): void => this.unsubscribeToTradeEvent()
  }

  public unsubscribeToTradeEvent(): void {
    Object.keys(this.subscriptions.trade).forEach(networkId => {
      logDebug(`[ExchangeApiImpl] Unsubscribing trade events for network ${networkId}`)
      this.subscriptions.trade[networkId].unsubscribe()
    })
  }

  private async getTradeSubscription(params: PastEventsParams): Promise<TradeSubscription> {
    const { userAddress, networkId } = params

    const contract = await this._getContract(networkId)

    if (!this.subscriptions.trade[networkId]) {
      this.subscriptions.trade[networkId] = contract.events.Trade({
        filter: { owner: userAddress },
      })
    }

    return this.subscriptions.trade[networkId]
  }

  private parseTradeEvent(event: TradeEvent): BaseTradeEvent {
    const {
      returnValues: { orderId, sellToken: sellTokenId, buyToken: buyTokenId, executedSellAmount, executedBuyAmount },
      transactionHash: txHash,
      logIndex: eventIndex,
      blockNumber,
    } = event

    const trade: BaseTradeEvent = {
      orderId,
      sellTokenId: +sellTokenId,
      buyTokenId: +buyTokenId,
      sellAmount: new BN(executedSellAmount),
      buyAmount: new BN(executedBuyAmount),
      txHash,
      eventIndex,
      blockNumber,
      id: `${txHash}|${eventIndex}`,
    }

    return trade
  }

  public async getOrder({ userAddress, networkId, orderId }: GetOrderParams): Promise<Order> {
    const contract = await this._getContract(networkId)
    logDebug(`[ExchangeApiImpl] Getting order ${orderId} for account ${userAddress}`)

    const rawOrder = await contract.methods.orders(userAddress, orderId).call()

    return decodeOrder(rawOrder)
  }

  public async getOrderFromOrderPlacementEvent({
    userAddress,
    networkId,
    orderId,
    buyTokenId: buyToken = '',
    sellTokenId: sellToken = '',
    toBlock,
  }: GetOrderFromOrderPlacementEventParams): Promise<Order> {
    const contract = await this._getContract(networkId)

    const orderPlacementEvents = await this.safeGetEvents(
      options => contract.getPastEvents('OrderPlacement', options),
      {
        // Indexed values: https://github.com/gnosis/dex-contracts/blob/master/contracts/BatchExchange.sol#L97
        filter: { owner: userAddress, sellToken, buyToken },
        // Have to search since contract creation
        fromBlock: CONTRACT_DEPLOYMENT_BLOCK[networkId],
        // Limit search to Trade event emit block
        toBlock,
      },
    )

    // This list might be big, but there's no way around it at the moment
    const orderPlacementEvent = orderPlacementEvents.find(event => event.returnValues.index === orderId)

    // Should exist and be unique
    assert(
      orderPlacementEvent,
      `No order was placed on network ${networkId} for address ${userAddress} and id ${orderId}`,
    )

    const values = orderPlacementEvent.returnValues

    return {
      buyTokenId: +values.buyToken,
      sellTokenId: +values.sellToken,
      validFrom: +values.validFrom,
      validUntil: +values.validUntil,
      priceNumerator: new BN(values.priceNumerator),
      priceDenominator: new BN(values.priceDenominator),
      remainingAmount: new BN('NaN'), // not available on OrderPlacement
    }
  }

  public async getOrders({ userAddress, networkId }: GetOrdersParams): Promise<AuctionElement[]> {
    const contract = await this._getContract(networkId)
    logDebug(`[ExchangeApiImpl] Getting Orders for account ${userAddress}`)

    const encodedOrders = await contract.methods.getEncodedUserOrders(userAddress).call()

    // is null if Contract returns empty bytes
    if (!encodedOrders) return []

    return decodeAuctionElements(encodedOrders)
  }

  public async getOrdersPaginated({
    userAddress,
    networkId,
    offset,
    pageSize = DEFAULT_ORDERS_PAGE_SIZE,
  }: GetOrdersPaginatedParams): Promise<GetOrdersPaginatedResult> {
    const contract = await this._getContract(networkId)

    logDebug(
      `[ExchangeApiImpl] Getting Orders Paginated for account ${userAddress} on network ${networkId} with offset ${offset} and pageSize ${pageSize}`,
    )

    // query 1 more than required to check whether there's a next page
    const encodedOrders = await contract.methods.getEncodedUserOrdersPaginated(userAddress, offset, pageSize + 1).call()

    // is null if Contract returns empty bytes
    if (!encodedOrders) return { orders: [] }

    const orders = decodeAuctionElements(encodedOrders, offset)

    if (orders.length <= pageSize) {
      // no more pages left, indicate by not returning `nextIndex`
      return { orders }
    } else {
      // there is at least 1 item in the next page
      // pop the extra element
      const nextPageOrder = orders.pop() as AuctionElement
      // get its id as nextIndex
      const nextIndex = Number(nextPageOrder.id)
      return { orders, nextIndex }
    }
  }

  public async getNumTokens(networkId: number): Promise<number> {
    const contract = await this._getContract(networkId)
    const numTokens = await contract.methods.numTokens().call()
    return +numTokens
  }

  /**
   * Fee is 1/fee_denominator.
   * i.e. 1/1000 = 0.1%
   */
  public async getFeeDenominator(networkId: number): Promise<number> {
    const contract = await this._getContract(networkId)
    const feeDenominator = await contract.methods.FEE_DENOMINATOR().call()
    return +feeDenominator
  }

  public async getTokenAddressById({ tokenId, networkId }: GetTokenAddressByIdParams): Promise<string> {
    const contract = await this._getContract(networkId)
    return contract.methods.tokenIdToAddressMap(tokenId).call()
  }

  public async getTokenIdByAddress({ tokenAddress, networkId }: GetTokenIdByAddressParams): Promise<number> {
    const contract = await this._getContract(networkId)
    const tokenId = await contract.methods.tokenAddressToIdMap(tokenAddress).call()
    return +tokenId
  }

  public async hasToken({ tokenAddress, networkId }: HasTokenParams): Promise<boolean> {
    const contract = await this._getContract(networkId)
    return contract.methods.hasToken(tokenAddress).call()
  }

  public async addToken({ userAddress, tokenAddress, networkId, txOptionalParams }: AddTokenParams): Promise<Receipt> {
    const contract = await this._getContract(networkId)
    const tx = contract.methods.addToken(tokenAddress).send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    logDebug(`[ExchangeApiImpl] Added Token ${tokenAddress}`)

    return tx
  }

  public async placeOrder(params: PlaceOrderParams): Promise<Receipt> {
    const {
      userAddress,
      buyTokenId,
      sellTokenId,
      validUntil,
      buyAmount,
      sellAmount,
      networkId,
      txOptionalParams,
    } = params

    const contract = await this._getContract(networkId)

    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/dex-react/issues/231
    const tx = contract.methods
      .placeOrder(buyTokenId, sellTokenId, validUntil, buyAmount.toString(), sellAmount.toString())
      .send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    logDebug(
      `[ExchangeApiImpl] Placed Order to 
      SELL ${sellAmount.toString()} tokenId ${sellTokenId} for ${buyAmount.toString()} tokenId ${buyTokenId}
      order valid until ${validUntil}
      `,
    )

    return tx
  }

  public async placeValidFromOrders({
    userAddress,
    networkId,
    buyTokens,
    sellTokens,
    validFroms,
    validUntils,
    buyAmounts,
    sellAmounts,
    txOptionalParams,
  }: PlaceValidFromOrdersParams): Promise<Receipt> {
    const length = buyTokens.length
    assert(
      [sellTokens, validFroms, validUntils, buyAmounts, sellAmounts].every(el => el.length === length),
      'Parameters length do not match',
    )
    assert(length > 0, 'At least one order required')

    const contract = await this._getContract(networkId)

    const buyAmountsStr = buyAmounts.map(String)
    const sellAmountsStr = sellAmounts.map(String)

    const tx = contract.methods
      .placeValidFromOrders(buyTokens, sellTokens, validFroms, validUntils, buyAmountsStr, sellAmountsStr)
      .send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    logDebug(
      `[ExchangeApiImpl] Placed multiple orders for user ${userAddress} with the following params:\n
      buyTokens: ${buyTokens}\n
      sellTokens: ${sellTokens}\n
      validFroms: ${validFroms}\n
      validUntils: ${validUntils}\n
      buyAmounts: ${buyAmountsStr}\n
      sellAmounts: ${sellAmountsStr}`,
    )

    return tx
  }

  public async cancelOrders({
    userAddress,
    orderIds,
    networkId,
    txOptionalParams,
  }: CancelOrdersParams): Promise<Receipt> {
    const contract = await this._getContract(networkId)
    const tx = contract.methods.cancelOrders(orderIds).send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    logDebug(`[ExchangeApiImpl] Cancelled Orders ${orderIds}`)

    return tx
  }
}

export default ExchangeApiImpl
