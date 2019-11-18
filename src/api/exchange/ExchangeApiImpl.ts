import assert from 'assert'

import { DepositApiImpl } from './DepositApiImpl'
import { ExchangeApi, Order, PlaceOrderParams, Receipt, TxOptionalParams, StablecoinConverter } from 'types'
import StablecoinConvertedAbi from './StablecoinConverterAbi'
import { log } from 'utils'

import Web3 from 'web3'

/**
 * Basic implementation of Stable Coin Converter API
 */
export class ExchangeApiImpl extends DepositApiImpl implements ExchangeApi {
  private _ReferenceExchangeContract: StablecoinConverter

  protected static _address2ContractCache: { [K: string]: StablecoinConverter } = {}

  public constructor(web3: Web3) {
    super(web3)

    this._ReferenceExchangeContract = new web3.eth.Contract(StablecoinConvertedAbi)

    // TODO remove later
    ;(window as any).exchange = this._ReferenceExchangeContract
  }

  public async getOrders(userAddress: string): Promise<Order[]> {
    // TODO different API
    // can't return a dynamic array from a contract
    // const contract = await this._getContract()
    // return contract.methods.orders(userAddress).call()

    log(`[ExchangeApiImpl] Getting Orders for account ${userAddress}`)

    return []
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
    senderAddress: string,
    orderId: number,
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const contract = await this._getContract()
    const tx = contract.methods.cancelOrder([orderId]).send({ from: senderAddress })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[ExchangeApiImpl] Cancelled Order ${orderId}`)

    return tx
  }

  /********************************    private methods   ********************************/

  protected async _getContract(): Promise<StablecoinConverter> {
    const networkId = await this._getNetworkId()

    return this._getContractForNetwork(networkId)
  }

  protected _getContractForNetwork(networkId: number): StablecoinConverter {
    const address = this.getContractAddress(networkId)

    assert(address, `StablecoinConverter was not deployed to network ${networkId}`)

    return this._getContractAtAddress(address)
  }

  protected _getContractAtAddress(address: string): StablecoinConverter {
    const contract = ExchangeApiImpl._address2ContractCache[address]

    if (contract) return contract

    const newContract = this._ReferenceExchangeContract.clone()
    newContract.options.address = address

    return (ExchangeApiImpl._address2ContractCache[address] = newContract)
  }
}

export default ExchangeApiImpl
