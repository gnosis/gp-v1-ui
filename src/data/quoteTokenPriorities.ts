import { Network } from 'types'

interface QuoteTokenPriorityObject {
  priority: number | undefined
  addresses: {
    [network: number]: string[]
  }
}

type QuoteTokenPriorityList = QuoteTokenPriorityObject[]

const quoteTokenPriorityList: QuoteTokenPriorityList = [
  {
    // USD coins
    priority: 1,
    addresses: {
      [Network.Mainnet]: [
        '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
        '0x0000000000085d4780B73119b644AE5ecd22b376', // TUSD
        '0x8e870d67f660d95d5be530380d0ec0bd388289e1', // PAX
        '0x4Fabb145d64652a948d72533023f6E7A623C7C53', // BUSD
        '0xdf574c24545e5ffecb9a659c229253d4111d87e1', // HUSD
        '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', // sUSD
        '0xe2f2a5c287993345a840db3b0845fbc70f5935a5', // mUSD
        '0x1c48f86ae57291f7686349f12601910bd8d470bb', // USDK
        '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd', // GUSD
        '0x196f4727526eA7FB1e17b2071B3d8eAA38486988', // RSV
        '0xa4bdb11dc0a2bec88d24a3aa1e6bb17201112ebe', // USDS
        '0x9a48bd0ec040ea4f1d3147c025cd4076a2e71e3e', // USD++
      ],
      // Rinkeby
      [Network.Rinkeby]: [
        '0xa9881E6459CA05d7D7C95374463928369cD7a90C', // USDT
        '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b', // USDC
        '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa', // DAI
        '0x0000000000085d4780B73119b644AE5ecd22b376', // TUSD
        '0xBD6A9921504fae42EaD2024F43305A8ED3890F6f', // PAX
        '0x1b642a124CDFa1E5835276A6ddAA6CFC4B35d52c', // sUSD
        '0x784B46A4331f5c7C495F296AE700652265ab2fC6', // GUSD
      ],
    },
  },
  {
    // OWL
    priority: 2,
    addresses: {
      [Network.Mainnet]: ['0x1a5f9352af8af974bfc03399e3767df6370d82e4'], // OWL
      // Rinkeby
      [Network.Rinkeby]: [],
    },
  },
  {
    // non-USD stablecoins
    priority: 3,
    addresses: {
      [Network.Mainnet]: [
        '0xdb25f211ab05b1c97d595516f45794528a807ad8', // EURS
        '0x2c537e5624e4af88a7ae4060c022609376c8d0eb', // TRYB
        '0xc9a2c4868f0f96faaa739b59934dc9cb304112ec', // GBP
        '0xa689dcea8f7ad59fb213be4bc624ba5500458dc6', // EBASE
        '0x9cb2f26a23b8d89973f08c957c4d7cdf75cd341c', // DZAR
        '0x1fc31488f28ac846588ffa201cde0669168471bd', // UAX
      ],
      // Rinkeby
      [Network.Rinkeby]: [],
    },
  },
  {
    // WETH
    priority: 4,
    addresses: {
      [Network.Mainnet]: [
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
      ],
      // Rinkeby
      [Network.Rinkeby]: [
        '0xc778417E063141139Fce010982780140Aa0cD5Ab', // WETH
      ],
    },
  },
]

export default quoteTokenPriorityList
