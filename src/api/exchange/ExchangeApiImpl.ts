import { DepositApiImpl } from './DepositApiImpl'
import { ExchangeApi, PlaceOrderParams, Receipt, TxOptionalParams, AuctionElement } from 'types'
import { BatchExchange } from 'types/BatchExchange'
import BatchExchangeAbi from './BatchExchangeAbi'
import { log, assert } from 'utils'

import BN from 'bn.js'

import Web3 from 'web3'

const ADDRESS_WIDTH = 20 * 2
const UINT256_WIDTH = 32 * 2
const UINT16_WIDTH = 2 * 2
const UINT32_WIDTH = 4 * 2
const UINT128_WIDTH = 16 * 2

const hexPattern = '[0-9a-fA-F]'

const hn = (n: number): string => hexPattern + `{${n}}`

// /(address)(sellTokenBalance)(buyTokenId)(sellTokenId)(validFrom)(validUntil)(priceNumerator)(priceDenominator)(remainingAmount)/g
const orderPattern = `(?<user>${hn(ADDRESS_WIDTH)})(?<sellTokenBalance>${hn(UINT256_WIDTH)})(?<buyTokenId>${hn(
  UINT16_WIDTH,
)})(?<sellTokenId>${hn(UINT16_WIDTH)})(?<validFrom>${hn(UINT32_WIDTH)})(?<validUntil>${hn(
  UINT32_WIDTH,
)})(?<priceNumerator>${hn(UINT128_WIDTH)})(?<priceDenominator>${hn(UINT128_WIDTH)})(?<remainingAmount>${hn(
  UINT128_WIDTH,
)})`

// decodes Orders
const decodeAuctionElements = (bytes: string): AuctionElement[] => {
  const result: AuctionElement[] = []
  const oneOrder = new RegExp(orderPattern, 'g')
  let order
  let index = 0 // order ID is given by position and it's not part of the encoded data

  while ((order = oneOrder.exec(bytes))) {
    const {
      user,
      sellTokenBalance,
      buyTokenId,
      sellTokenId,
      validFrom,
      validUntil,
      priceNumerator,
      priceDenominator,
      remainingAmount,
    } = order.groups as {
      user: string
      sellTokenBalance: string
      buyTokenId: string
      sellTokenId: string
      validFrom: string
      validUntil: string
      priceNumerator: string
      priceDenominator: string
      remainingAmount: string
    }

    result.push({
      user: '0x' + user,
      sellTokenBalance: new BN(sellTokenBalance, 16),
      id: index++,
      buyTokenId: parseInt(buyTokenId, 16),
      sellTokenId: parseInt(sellTokenId, 16),
      validFrom: parseInt(validFrom, 16),
      validUntil: parseInt(validUntil, 16),
      priceNumerator: new BN(priceNumerator, 16),
      priceDenominator: new BN(priceDenominator, 16),
      remainingAmount: new BN(remainingAmount, 16),
    })
  }
  return result
}
/**
 * Basic implementation of Stable Coin Converter API
 */
export class ExchangeApiImpl extends DepositApiImpl implements ExchangeApi {
  private _ReferenceExchangeContract: BatchExchange

  protected static _address2ContractCache: { [K: string]: BatchExchange } = {}

  public constructor(web3: Web3) {
    super(web3)

    this._ReferenceExchangeContract = new web3.eth.Contract(BatchExchangeAbi)

    // TODO remove later
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).exchange = this._ReferenceExchangeContract
  }

  public async getOrders(userAddress: string): Promise<AuctionElement[]> {
    const contract = await this._getContract()
    log(`[ExchangeApiImpl] Getting Orders for account ${userAddress}`)

    const encodedOrders = await contract.methods.getEncodedUserOrders(userAddress).call()

    // is null if Contract returns empty bytes
    if (!encodedOrders) return []

    return decodeAuctionElements(encodedOrders)
  }

  public async getNumTokens(): Promise<number> {
    const contract = await this._getContract()
    const numTokens = await contract.methods.numTokens().call()
    return +numTokens
  }

  /**
   * Fee is 1/fee_denominator.
   * i.e. 1/1000 = 0.1%
   */
  public async getFeeDenominator(): Promise<number> {
    const contract = await this._getContract()
    const feeDenominator = await contract.methods.feeDenominator().call()
    return +feeDenominator
  }

  public async getTokenAddressById(tokenId: number): Promise<string> {
    const contract = await this._getContract()
    return contract.methods.tokenIdToAddressMap(tokenId).call()
  }

  public async getTokenIdByAddress(tokenAddress: string): Promise<number> {
    const contract = await this._getContract()
    const tokenId = await contract.methods.tokenAddressToIdMap(tokenAddress).call()
    return +tokenId
  }

  public async addToken(tokenAddress: string, txOptionalParams?: TxOptionalParams): Promise<Receipt> {
    const contract = await this._getContract()
    const tx = contract.methods.addToken(tokenAddress).send()

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[ExchangeApiImpl] Added Token ${tokenAddress}`)

    return tx
  }

  public async placeOrder(orderParams: PlaceOrderParams, txOptionalParams?: TxOptionalParams): Promise<Receipt> {
    const { userAddress, buyTokenId, sellTokenId, validUntil, buyAmount, sellAmount } = orderParams

    const contract = await this._getContract()

    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/dex-react/issues/231
    const tx = contract.methods
      .placeOrder(buyTokenId, sellTokenId, validUntil, buyAmount.toString(), sellAmount.toString())
      .send({ from: userAddress })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(
      `[ExchangeApiImpl] Placed Order to 
      SELL ${sellAmount.toString()} tokenId ${sellTokenId} for ${buyAmount.toString()} tokenId ${buyTokenId}
      order valid until ${validUntil}
      `,
    )

    return tx
  }

  public async cancelOrder(
    { senderAddress, orderId }: { senderAddress: string; orderId: number },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const contract = await this._getContract()
    const tx = contract.methods.cancelOrders([orderId]).send({ from: senderAddress })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[ExchangeApiImpl] Cancelled Order ${orderId}`)

    return tx
  }

  /********************************    private methods   ********************************/

  protected async _getContract(): Promise<BatchExchange> {
    const networkId = await this._getNetworkId()

    return this._getContractForNetwork(networkId)
  }

  protected _getContractForNetwork(networkId: number): BatchExchange {
    const address = this.getContractAddress(networkId)

    assert(address, `BatchExchange was not deployed to network ${networkId}`)

    return this._getContractAtAddress(address)
  }

  protected _getContractAtAddress(address: string): BatchExchange {
    const contract = ExchangeApiImpl._address2ContractCache[address]

    if (contract) return contract

    const newContract = this._ReferenceExchangeContract.clone()
    newContract.options.address = address

    return (ExchangeApiImpl._address2ContractCache[address] = newContract)
  }
}

export default ExchangeApiImpl
