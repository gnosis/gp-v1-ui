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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async fetchTokenIdsFromExchange(_networkId: number): Promise<void> {
    // Simply inserts ID into tokens
    this._tokenList = this._tokenList.map((token, index) => ({ ...token, id: index }))
  }
}

export default TokenListApiMock
