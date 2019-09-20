import { TokenDetails } from 'types'
import { TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, TOKEN_6, TOKEN_7 } from './basic'

// Ether, Tether, TrueUSD, USD Coin, Paxos Gemini, Dai
const tokens: TokenDetails[] = [
  // Wrapped Ether
  //  https://weth.io
  //  Wrapper of Ether to make it ERC-20 compliant
  {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    addressMainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png`,
    address: TOKEN_1,
  },

  // Tether:
  //  https://tether.to/
  //  Fiat enabled collateralized stable coin, that is backed by the most popular fiat currency, USD (US Dollar) in a 1:1 ratio
  {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    addressMainnet: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdac17f958d2ee523a2206206994597c13d831ec7/logo.png`,
    address: TOKEN_2,
  },

  // TrueUSD
  //  https://www.trusttoken.com/trueusd
  //  US Dollar backed stable coin which is totally fiat-collateralized
  {
    name: 'TrueUSD',
    symbol: 'TUSD',
    decimals: 18,
    addressMainnet: '0x0000000000085d4780B73119b644AE5ecd22b376',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0000000000085d4780B73119b644AE5ecd22b376/logo.png`,
    address: TOKEN_3,
  },

  // USD Coin
  //  https://www.circle.com/en/usdc
  //  legitimate built on open standards
  //  using Grant Thornton for verifying Circle’s US dollar reserves
  //  launched by cryptocurrency finance firm circle Internet financial Ltd and the CENTRE open source consortium launched
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    addressMainnet: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png`,
    address: TOKEN_4,
  },

  // Paxos Standard (PAX)
  //  https://www.paxos.com/standard
  //  regulated stable coin. PAX is backed by US Dollar in equivalent 1:1.
  //  launched by Paxos Trust Company
  //  approved by the New York State Department of Financial Services
  {
    name: 'Paxos Standard',
    symbol: 'PAX',
    decimals: 18,
    addressMainnet: '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x8e870d67f660d95d5be530380d0ec0bd388289e1/logo.png`,
    address: TOKEN_5,
  },

  // Paxos Gemini
  //  https://gemini.com/dollar/
  //  regulated by the New York State Department of Financial Services
  //  launched same day as PAX by Gemini Trust Company. backed by USD
  {
    name: 'Paxos Gemini',
    symbol: 'GUSD',
    decimals: 2,
    addressMainnet: '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd/logo.png`,
    address: TOKEN_6,
  },

  // MakerDAO (DAI)
  //  https://makerdao.com/
  //  crypto-collateralized cryptocurrency: stable coin which is pegged to USD
  {
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    addressMainnet: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359/logo.png`,
    address: TOKEN_7,
  },
]

export default tokens
