import { TokenList, TokenDetails } from 'types'
export class TokenListApiMock implements TokenList {
  private _tokenList: TokenDetails[]

  public constructor(tokenList: TokenDetails[]) {
    this._tokenList = tokenList
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getTokens(_networkId: number): TokenDetails[] {
    return this._tokenList
  }
}

export default TokenListApiMock
