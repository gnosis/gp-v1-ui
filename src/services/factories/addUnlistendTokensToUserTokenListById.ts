import { TokenList } from 'api/tokenList/TokenListApi'
import { WalletApi } from 'api/wallet/WalletApi'
import { TokenDetails } from 'types'
import { GetByIdParams } from './'

interface FactoryParams {
  tokenListApi: TokenList
  walletApi: WalletApi
}

interface Injects {
  getTokenFromExchangeById(params: GetByIdParams): Promise<TokenDetails | null>
}

/**
 * Factory of addUnlistendTokensToUserTokenListById
 * Takes as input API instances
 * Returns async function to add unlisted tokens to USER_TOKEN_LIST by id
 * only adds token not alredy in the list
 */
function addUnlistendTokensToUserTokenListByIdFactory(
  factoryParams: FactoryParams,
  { getTokenFromExchangeById }: Injects,
): (tokenIds: number[]) => Promise<void> {
  const { tokenListApi, walletApi } = factoryParams

  return async (tokenIds: number[]): Promise<void> => {
    const networkId = await walletApi.getNetworkId()
    if (networkId) {
      const tokensFromExchange = await Promise.all(
        // calls are already cached, so we don't get duplicate calls later in components
        tokenIds.map(tokenId => getTokenFromExchangeById({ tokenId, networkId })),
      )

      // only unlisted tokens get added inside
      tokenListApi.addTokens({
        tokens: tokensFromExchange.filter<TokenDetails>((token): token is TokenDetails => !!token),
        networkId,
      })
    }
  }
}

export { addUnlistendTokensToUserTokenListByIdFactory }
