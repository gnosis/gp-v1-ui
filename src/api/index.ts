import { TokenApi, Network } from 'types'
import { TokenApiImpl } from './TokenApi/TokenApiImpl'

// Build APIs
export const tokenApi: TokenApi = new TokenApiImpl([Network.Mainnet, Network.Rinkeby])
