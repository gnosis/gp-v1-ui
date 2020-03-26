import { TokenDetails } from 'types'
import { TokenList, AddTokenParams, HasTokenParams } from './TokenListApi'

export class TokenListApiMock implements TokenList {
  private _tokenList: TokenDetails[]

  public constructor(tokenList: TokenDetails[]) {
    this._tokenList = tokenList
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getTokens(_networkId: number): TokenDetails[] {
    return this._tokenList
  }

  public addToken({ token }: AddTokenParams): void {
    this._tokenList.push(token)
  }

  public hasToken({ tokenAddress }: HasTokenParams): boolean {
    return !!this._tokenList.find(({ address }) => address === tokenAddress)
  }
}

export default TokenListApiMock
