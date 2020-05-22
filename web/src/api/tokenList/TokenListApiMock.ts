import { TokenDetails } from 'types'
import { TokenList, AddTokenParams, HasTokenParams, PersistTokensParams, AddTokensParams } from './TokenListApi'
import GenericSubscriptions from './Subscriptions'

export class TokenListApiMock extends GenericSubscriptions<TokenDetails[]> implements TokenList {
  private _tokenList: TokenDetails[]

  public constructor(tokenList: TokenDetails[]) {
    super()

    this._tokenList = tokenList
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getTokens(_networkId: number): TokenDetails[] {
    return this._tokenList
  }

  public addToken({ token }: AddTokenParams): void {
    this._tokenList = this._tokenList.concat(token)
    this.triggerSubscriptions(this.getTokens(1))
  }

  public addTokens({ tokens }: AddTokensParams): void {
    this._tokenList = this._tokenList.concat(tokens)
    this.triggerSubscriptions(this.getTokens(1))
  }

  public hasToken({ tokenAddress }: HasTokenParams): boolean {
    return !!this._tokenList.find(({ address }) => address === tokenAddress)
  }

  public persistTokens({ tokenList }: PersistTokensParams): void {
    this._tokenList = tokenList
    this.triggerSubscriptions(tokenList)
  }
}

export default TokenListApiMock
