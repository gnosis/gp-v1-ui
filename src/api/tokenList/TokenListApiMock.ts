import { TokenDetails } from 'types'
import { TokenList, AddTokenParams, AddTokenResult, AddTokenToExchangeParams } from './TokenListApi'

export class TokenListApiMock implements TokenList {
  private _tokenList: TokenDetails[]

  public constructor(tokenList: TokenDetails[]) {
    this._tokenList = tokenList
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getTokens(_networkId: number): TokenDetails[] {
    return this._tokenList
  }

  public async addTokenToList({ tokenAddress, networkId }: AddTokenParams): Promise<AddTokenResult> {
    this._tokenList.push({
      id: this._tokenList.length + 1,
      name: 'New Token',
      symbol: 'NTK',
      decimals: 18,
      addressMainnet: '0x12345',
      image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x12345/logo.png`,
      address: tokenAddress,
    })
    return {
      success: true,
      tokenList: this.getTokens(networkId),
    }
  }

  public addTokenToExchange(params: AddTokenToExchangeParams): Promise<AddTokenResult> {
    return this.addTokenToList(params)
  }
}

export default TokenListApiMock
