import { Network } from 'types'

const Network2Epoch = {
  // TODO get addresses from env or a centralized place (npm package?)
  [Network.Rinkeby]: '0x9046451F7cF124c1d7d1832F76F5e98a33D1610E',
  // TODO fill in when deployed
  [Network.Mainnet]: '',
}

export const getEpochAddressForNetwork = (networkId: Network): string | null => Network2Epoch[networkId] || null

export default Network2Epoch
