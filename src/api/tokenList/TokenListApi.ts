import { TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'
import { logDebug } from 'utils'

export interface TokenList {
  getTokens: (networkId: number) => TokenDetails[]
  addToken: (params: AddTokenParams) => void
}

export interface AddTokenParams {
  networkId: number
  token: TokenDetails
}

export interface HasTokenParams {
  networkId: number
  tokenAddress: string
}

/**
 * Basic implementation of Token API
 *
 * Has a pre-define list of tokens.
 */
export class TokenListApiImpl implements TokenList {
  public networkIds: number[]
  private _tokensByNetwork: { [networkId: number]: TokenDetails[] }
  private _tokenAddressNetworkSet: Set<string>

  public constructor(networkIds: number[]) {
    this.networkIds = networkIds

    // Init the tokens by network
    this._tokensByNetwork = {}
    this._tokenAddressNetworkSet = new Set<string>()

    networkIds.forEach(networkId => {
      // initial value
      const tokenList = getTokensByNetwork(networkId).concat(this.loadUserTokenList(networkId))
      this._tokensByNetwork[networkId] = tokenList

      tokenList.forEach(({ address }) => {
        this._tokenAddressNetworkSet.add(
          TokenListApiImpl.constructAddressNetworkKey({ tokenAddress: address, networkId }),
        )
      })
    })
  }

  public hasToken(params: HasTokenParams): boolean {
    return this._tokenAddressNetworkSet.has(TokenListApiImpl.constructAddressNetworkKey(params))
  }

  public getTokens(networkId: number): TokenDetails[] {
    return this._tokensByNetwork[networkId] || []
  }

  private static constructAddressNetworkKey({ tokenAddress, networkId }: HasTokenParams): string {
    return tokenAddress.toLowerCase() + '|' + networkId
  }

  private static getUserTokenListName(networkId: number): string {
    return 'USER_TOKEN_LIST_' + networkId
  }

  // {
  //     "id": 6,
  //     "name": "Gemini dollar",
  //     "symbol": "GUSD",
  //     "decimals": 2,
  //     "addressByNetwork": {
  //         "1": "0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd",
  //         "4": "0x784B46A4331f5c7C495F296AE700652265ab2fC6"
  //     },
  //     "website": "https://gemini.com/dollar/",
  //     "description": "Regulated by the New York State Department of Financial Services launched same day as PAX by Gemini Trust Company. backed by USD",
  //     "rinkeby_faucet": "mint using Team's shared account 0xf85D1a0E1b71e72013Db51139f285C6d5356B712. Using ERC20Impl (0x8d54C3af182A5ef4f74e7eCC07aB6182153797bB) contract, call `requestPrint(address, amount). On same contract, use the `lockId` returned from previous call and execute `confirmPrint(lockId)`."
  // },

  public addToken({ networkId, token }: AddTokenParams): void {
    logDebug('Added new Token to userlist', token)

    this._tokensByNetwork[networkId].push(token)
    this.persistUserTokenList(token, networkId)
    // return this.getTokens(networkId)
  }

  private loadUserTokenList(networkId: number): TokenDetails[] {
    const storageKey = TokenListApiImpl.getUserTokenListName(networkId)
    const listStringified = localStorage.getItem(storageKey)
    return listStringified ? JSON.parse(listStringified) : []
  }

  private persistUserTokenList(token: TokenDetails, networkId: number): void {
    const storageKey = TokenListApiImpl.getUserTokenListName(networkId)
    const listStringified = localStorage.getItem(storageKey)
    const currentUserList: TokenDetails[] = listStringified ? JSON.parse(listStringified) : []

    currentUserList.push(token)
    localStorage.setItem(storageKey, JSON.stringify(currentUserList))
  }
}

export default TokenListApiImpl
