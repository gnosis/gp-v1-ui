import { Network } from 'types'

const Network2Epoch = {
  // TODO get addresses from env or a centralized place (npm package?)
  [Network.Rinkeby]: '0x89593E017D4A88c60347257DAfB95384a422da09',
  // TODO fill in when deployed
  [Network.Mainnet]: '',
}

export const getEpochAddressForNetwork = (networkId: Network): string | null => Network2Epoch[networkId] || null

export default Network2Epoch
