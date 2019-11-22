import assert from 'assert'

import { DepositApiImpl } from './DepositApiImpl'
import { ExchangeApi, PlaceOrderParams, Receipt, TxOptionalParams, StablecoinConverter, AuctionElement } from 'types'
import StablecoinConvertedAbi from './StablecoinConverterAbi'
import { log } from 'utils'

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

// decodes Orders for a userAddress if passed one
// otherwise decodes all Orders for all users
const decodeAuctionElements = (bytes: string, userAddress?: string): AuctionElement[] => {
  const userAddressLC = userAddress && userAddress.toLowerCase()
  const result: AuctionElement[] = []
  const oneOrder = new RegExp(orderPattern, 'g')
  let order
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
    } = order.groups

    const user0x = '0x' + user

    // consider user matching if userAddress wasn't given (we match all users)
    // or userAdrres is Order.user
    const userMatch = !userAddressLC || userAddressLC === user0x.toLowerCase()

    // if passed userAddress and now encounters a different user (so !userMatch)
    // and have already found some orders for that address
    // can stop decoding,
    // because StablecoinConverter.getEncodedAuctionElements fills in orders by user
    // [orders[users[0]][0],orders[users[0]][1],orders[users[1]][0],orders[users[1]][1],...]
    // so a specific user's orders are always contiguous
    if (!userMatch && result.length > 0) break
    // userMatch always true when no userAdress given, so never breaks the loop

    // if not passed a userAddress OR if passed one and it matches Order.user
    // add Order to results
    if (userMatch) {
      result.push({
        user: user0x,
        sellTokenBalance: new BN(sellTokenBalance, 16),
        buyTokenId: parseInt(buyTokenId, 16),
        sellTokenId: parseInt(sellTokenId, 16),
        validFrom: parseInt(validFrom, 16),
        validUntil: parseInt(validUntil, 16),
        priceNumerator: new BN(priceNumerator, 16),
        priceDenominator: new BN(priceDenominator, 16),
        remainingAmount: new BN(remainingAmount, 16),
      })
    }
  }
  return result
}
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

  public async getOrders(userAddress: string): Promise<AuctionElement[]> {
    const contract = await this._getContract()
    log(`[ExchangeApiImpl] Getting Orders for account ${userAddress}`)

    const encodedOrders = await contract.methods.getEncodedAuctionElements().call()

    // is null if Contract returns empty bytes
    if (!encodedOrders) return []

    return decodeAuctionElements(encodedOrders, userAddress)
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
      .placeOrder(buyTokenId, sellTokenId, validUntil, buyAmount, sellAmount)
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
