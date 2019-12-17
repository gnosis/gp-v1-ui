import { Erc20Api, TxOptionalParams, Receipt } from 'types'
import BN from 'bn.js'
import assert from 'assert'
import { ZERO, ALLOWANCE_MAX_VALUE } from 'const'
import { RECEIPT } from '../../../test/data'
import { log } from 'utils'
import { waitAndSendReceipt } from 'utils/mock'

interface Balances {
  [userAddress: string]: { [tokenAddress: string]: BN }
}

interface Allowances {
  [userAddress: string]: { [tokenAddress: string]: { [spenderAddress: string]: BN } }
}

interface Erc20Info {
  name?: string
  symbol?: string
  decimals?: number
}

interface Tokens {
  [tokenAddress: string]: Erc20Info
}

/**
 * Basic implementation of Wallet API
 */
export class Erc20ApiMock implements Erc20Api {
  private _balances: Balances
  private _allowances: Allowances
  private _totalSupply: BN
  private _tokens: Tokens

  public constructor({ balances = {}, allowances = {}, totalSupply = ALLOWANCE_MAX_VALUE, tokens = {} } = {}) {
    this._balances = balances
    this._allowances = allowances
    this._totalSupply = totalSupply
    this._tokens = tokens
  }

  public async balanceOf({ tokenAddress, userAddress }: { tokenAddress: string; userAddress: string }): Promise<BN> {
    const userBalances = this._balances[userAddress]
    if (!userBalances) {
      return ZERO
    }

    const balance = userBalances[tokenAddress]
    return balance ? balance : ZERO
  }

  public async name({ tokenAddress }: { tokenAddress: string }): Promise<string> {
    const erc20Info = this._initTokens(tokenAddress)

    // Throws when token without `name` to mock contract behavior
    this._assertTokenProperty(erc20Info, 'name')

    return erc20Info.name as string
  }

  public async symbol({ tokenAddress }: { tokenAddress: string }): Promise<string> {
    const erc20Info = this._initTokens(tokenAddress)

    // Throws when token without `symbol` to mock contract behavior
    this._assertTokenProperty(erc20Info, 'symbol')

    return erc20Info.symbol as string
  }

  public async decimals({ tokenAddress }: { tokenAddress: string }): Promise<number> {
    const erc20Info = this._initTokens(tokenAddress)

    // Throws when token without `decimals` to mock contract behavior
    this._assertTokenProperty(erc20Info, 'decimals')

    return erc20Info.decimals as number
  }

  public async totalSupply({ tokenAddress }: { tokenAddress: string }): Promise<BN> {
    log("Don't care about %s, just making TS shut up", tokenAddress)
    return this._totalSupply
  }

  public async allowance({
    tokenAddress,
    userAddress,
    spenderAddress,
  }: {
    tokenAddress: string
    userAddress: string
    spenderAddress: string
  }): Promise<BN> {
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
    {
      userAddress,
      tokenAddress,
      spenderAddress,
      amount,
    }: { userAddress: string; tokenAddress: string; spenderAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })

    this._initAllowances({ userAddress, tokenAddress, spenderAddress })
    this._allowances[userAddress][tokenAddress][spenderAddress] = amount
    log(
      `[Erc20ApiMock] Approved ${amount} for the spender ${spenderAddress} on the token ${tokenAddress}. User ${userAddress}`,
    )

    return RECEIPT
  }

  /**
   * Transfers from `senderAddress`. No allowance required.
   *
   * @param senderAddress The sender of the tx
   * @param tokenAddress The token being transferred
   * @param toAddress The recipient's address
   * @param amount The amount transferred
   * @param txOptionalParams Optional params
   */
  public async transfer(
    {
      fromAddress,
      tokenAddress,
      toAddress,
      amount,
    }: { fromAddress: string; tokenAddress: string; toAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })
    this._initBalances({ userAddress: fromAddress, tokenAddress })
    this._initBalances({ userAddress: toAddress, tokenAddress })

    const balance = this._balances[fromAddress][tokenAddress]
    assert(balance.gte(amount), "The user doesn't have enough balance")

    this._balances[fromAddress][tokenAddress] = balance.sub(amount)
    this._balances[toAddress][tokenAddress] = this._balances[toAddress][tokenAddress].add(amount)

    log(
      `[Erc20ApiMock:transfer] Transferred ${amount} of the token ${tokenAddress} from ${fromAddress} to ${toAddress}`,
    )

    return RECEIPT
  }

  /**
   * Transfers on behalf of `fromAddress` if `senderAddress` has allowance
   *
   * @param senderAddress The sender of the tx
   * @param tokenAddress The token being transferred
   * @param fromAddress The source of the tokens
   * @param toAddress The recipient's address
   * @param amount The amount transferred
   * @param txOptionalParams Optional params
   */
  public async transferFrom(
    {
      senderAddress,
      tokenAddress,
      fromAddress,
      toAddress,
      amount,
    }: {
      senderAddress: string
      tokenAddress: string
      fromAddress: string
      toAddress: string
      amount: BN
    },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })
    this._initBalances({ userAddress: fromAddress, tokenAddress })
    this._initBalances({ userAddress: toAddress, tokenAddress })
    this._initAllowances({ userAddress: fromAddress, tokenAddress, spenderAddress: senderAddress })

    const balance = this._balances[fromAddress][tokenAddress]
    assert(balance.gte(amount), "The user doesn't have enough balance")

    assert(
      this._hasAllowance({ fromAddress, tokenAddress, spenderAddress: senderAddress, amount }),
      'Not allowed to perform this transfer',
    )
    const allowance = this._allowances[fromAddress][tokenAddress][senderAddress]
    this._allowances[fromAddress][tokenAddress][senderAddress] = allowance.sub(amount)
    log(
      `[Erc20ApiMock:transferFrom] Updated allowance: ${allowance} => ${this._allowances[fromAddress][tokenAddress][senderAddress]}`,
    )

    this._balances[fromAddress][tokenAddress] = balance.sub(amount)
    this._balances[toAddress][tokenAddress] = this._balances[toAddress][tokenAddress].add(amount)

    log(
      `[Erc20ApiMock:transferFrom] Transferred ${amount} of the token ${tokenAddress} from ${fromAddress} to ${toAddress} by the spender ${senderAddress}`,
    )

    return RECEIPT
  }

  /********************************    private methods   ********************************/
  private _hasAllowance({
    fromAddress,
    tokenAddress,
    spenderAddress,
    amount,
  }: {
    fromAddress: string
    tokenAddress: string
    spenderAddress: string
    amount: BN
  }): boolean {
    const allowance = this._allowances[fromAddress][tokenAddress][spenderAddress]
    return allowance.gte(amount)
  }

  private _initBalances({ userAddress, tokenAddress }: { userAddress: string; tokenAddress: string }): BN {
    let userBalances = this._balances[userAddress]
    if (!userBalances) {
      userBalances = {}
      this._balances[userAddress] = userBalances
    }

    let tokenBalance = userBalances[tokenAddress]
    if (!tokenBalance) {
      tokenBalance = ZERO
      userBalances[tokenAddress] = tokenBalance
    }

    return tokenBalance
  }

  private _initAllowances({
    userAddress,
    tokenAddress,
    spenderAddress,
  }: {
    userAddress: string
    tokenAddress: string
    spenderAddress: string
  }): BN {
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
    if (!spenderAllowance) {
      spenderAllowance = ZERO
      userTokenAllowances[spenderAddress] = spenderAllowance
    }

    return spenderAllowance
  }

  private _initTokens(tokenAddress: string): Erc20Info {
    if (!this._tokens[tokenAddress]) {
      this._tokens[tokenAddress] = {}
    }

    return this._tokens[tokenAddress]
  }

  private _assertTokenProperty(tokenInfo: Erc20Info, property: keyof Erc20Info): void {
    if (!tokenInfo[property]) {
      throw new Error(`token does not implement '${property}'`)
    }
  }
}

export default Erc20ApiMock
