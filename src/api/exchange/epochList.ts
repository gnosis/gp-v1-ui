import { Network } from 'types'

const Network2Epoch = {
  // TODO get addresses from env or a centralized place (npm package?)
  [Network.Rinkeby]: '0x9D1a98dF71420035F67209af8c4138ea1C39b9d2',
  // TODO fill in when deployed
  [Network.Mainnet]: '',
}

export const getEpochAddressForNetwork = (networkId: Network): string | null => Network2Epoch[networkId] || null

export default Network2Epoch
