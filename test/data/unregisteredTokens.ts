import { FEE_TOKEN } from './basic'

export default {
  // OWL proxy, rinkeby https://github.com/gnosis/owl-token
  '0xa7d1c04faf998f9161fc9f800a99a809b84cfc9d': {
    name: 'OWL token',
    symbol: 'OWL',
    decimals: 18,
  },
  [FEE_TOKEN]: { name: 'Fee token', symbol: 'FEET', decimals: 18 },
}
