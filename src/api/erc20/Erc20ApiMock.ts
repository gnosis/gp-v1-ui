import { Erc20Api, TxOptionalParams, TxResult } from 'types'
import BN from 'bn.js'
import assert from 'assert'
import { ZERO } from 'const'
import { RECEIPT, CONTRACT } from '../../../test/data'
import { log } from 'utils'
import { waitAndSendReceipt } from 'utils/mock'

interface Balances {
  [userAddress: string]: { [tokenAddress: string]: BN }
}

interface Allowances {
  [userAddress: string]: { [tokenAddress: string]: { [spenderAddress: string]: BN } }
}

/**
 * Basic implementation of Wallet API
 */
export class Erc20ApiMock implements Erc20Api {
  private _balances: Balances
  private _allowances: Allowances
  private _sender: string

  public constructor({ balances = {}, allowances = {}, sender = CONTRACT } = {}) {
    this._balances = balances
    this._allowances = allowances
    this._sender = sender /* For this mock, the sender will always be the contract */
  }

  public async balanceOf(tokenAddress: string, userAddress: string): Promise<BN> {
    const userBalances = this._balances[userAddress]
    if (!userBalances) {
      return ZERO
    }

    const balance = userBalances[tokenAddress]
    return balance ? balance : ZERO
  }

  public async allowance(tokenAddress: string, userAddress: string, spenderAddress: string): Promise<BN> {
    const userAllowances = this._allowances[userAddress]
    if (!userAllowances) {
      return ZERO
    }

    const tokenAllowances = userAllowances[tokenAddress]
    if (!tokenAllowances) {
      return ZERO
    }

    const allowance = tokenAllowances[spenderAddress]
    return allowance ? allowance : ZERO
  }

  public async approve(
    tokenAddress: string,
    userAddress: string,
    spenderAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<boolean>> {
    await waitAndSendReceipt({ txOptionalParams })

    this._initAllowances(userAddress, tokenAddress, spenderAddress)
    this._allowances[userAddress][tokenAddress][spenderAddress] = amount
    log(
      `[Erc20ApiMock] Approved ${amount} for the spender ${spenderAddress} on the token ${tokenAddress}. User ${userAddress}`,
    )

    return { data: true, receipt: RECEIPT }
  }

  /**
   * Transfers from `this._sender`. No allowance required.
   *
   * @param tokenAddress The token being transferred
   * @param toAddress The recipient's address
   * @param amount The amount transferred
   * @param txOptionalParams Optional params
   */
  public async transfer(
    tokenAddress: string,
    toAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<boolean>> {
    await waitAndSendReceipt({ txOptionalParams })
    this._initBalances(this._sender, tokenAddress)
    this._initBalances(toAddress, tokenAddress)

    const balance = this._balances[this._sender][tokenAddress]
    assert(balance.gte(amount), "The user doesn't have enough balance")

    this._balances[this._sender][tokenAddress] = balance.sub(amount)
    this._balances[toAddress][tokenAddress] = this._balances[toAddress][tokenAddress].add(amount)

    log(
      `[Erc20ApiMock:transfer] Transferred ${amount} of the token ${tokenAddress} from ${this._sender} to ${toAddress}`,
    )

    return { data: true, receipt: RECEIPT }
  }

  /**
   * Transfers on behalf of `fromAddress` if `this._sender` has allowance
   *
   * @param tokenAddress The token being transferred
   * @param fromAddress The source of the tokens
   * @param toAddress The recipient's address
   * @param amount The amount transferred
   * @param txOptionalParams Optional params
   */
  public async transferFrom(
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<boolean>> {
    await waitAndSendReceipt({ txOptionalParams })
    this._initBalances(fromAddress, tokenAddress)
    this._initBalances(toAddress, tokenAddress)

    this._initAllowances(fromAddress, tokenAddress, this._sender)

    const balance = this._balances[fromAddress][tokenAddress]
    assert(balance.gte(amount), "The user doesn't have enough balance")

    assert(this._hasAllowance(fromAddress, tokenAddress, this._sender, amount), 'Not allowed to perform this transfer')
    const allowance = this._allowances[fromAddress][tokenAddress][this._sender]
    this._allowances[fromAddress][tokenAddress][this._sender] = allowance.sub(amount)
    log(
      `[Erc20ApiMock:transferFrom] Updated allowance: ${allowance} => ${
        this._allowances[fromAddress][tokenAddress][this._sender]
      }`,
    )

    this._balances[fromAddress][tokenAddress] = balance.sub(amount)
    this._balances[toAddress][tokenAddress] = this._balances[toAddress][tokenAddress].add(amount)

    log(
      `[Erc20ApiMock:transferFrom] Transferred ${amount} of the token ${tokenAddress} from ${fromAddress} to ${toAddress} by the spender ${this._sender}`,
    )

    return { data: true, receipt: RECEIPT }
  }

  /********************************    private methods   ********************************/
  private _hasAllowance(fromAddress: string, tokenAddress: string, spenderAddress: string, amount: BN): boolean {
    const allowance = this._allowances[fromAddress][tokenAddress][spenderAddress]
    return allowance.gte(amount)
  }

  private _initBalances(userAddress: string, tokenAddress: string): BN {
    let userBalances = this._balances[userAddress]
    if (!userBalances) {
      userBalances = {}
      this._balances[userAddress] = userBalances
    }

    let tokenBalance = userBalances[tokenAddress]
    if (!tokenBalance) {
      tokenBalance = ZERO
    }

    return tokenBalance
  }

  private _initAllowances(userAddress: string, tokenAddress: string, spenderAddress: string): BN {
    let userAllowances = this._allowances[userAddress]
    if (!userAllowances) {
      userAllowances = {}
      this._allowances[userAddress] = userAllowances
    }

    let userTokenAllowances = userAllowances[tokenAddress]
    if (!userTokenAllowances) {
      userTokenAllowances = {}
      userAllowances[tokenAddress] = userTokenAllowances
    }

    let spenderAllowance = userTokenAllowances[spenderAddress]
    if (!userTokenAllowances) {
      spenderAllowance = ZERO
      userTokenAllowances[spenderAddress] = spenderAllowance
    }

    return spenderAllowance
  }
}

export default Erc20ApiMock
