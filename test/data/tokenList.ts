import { TokenDetails } from 'types'
import { TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, TOKEN_6, TOKEN_7 } from './basic'

// Ether, Tether, TrueUSD, USD Coin, Paxos, Gemini, Dai
const tokens: TokenDetails[] = [
  // Wrapped Ether
  //  https://weth.io
  //  Wrapper of Ether to make it ERC-20 compliant
  {
    id: 1,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    addressMainnet: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    address: TOKEN_1,
  },

  // Tether:
  //  https://tether.to/
  //  Fiat enabled collateralized stable coin, that is backed by the most popular fiat currency, USD (US Dollar) in a 1:1 ratio
  {
    id: 2,
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    addressMainnet: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png`,
    address: TOKEN_2,
  },

  // TrueUSD
  //  https://www.trusttoken.com/trueusd
  //  US Dollar backed stable coin which is totally fiat-collateralized
  {
    id: 3,
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
    id: 4,
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    addressMainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png`,
    address: TOKEN_4,
  },

  // Paxos Standard (PAX)
  //  https://www.paxos.com/standard
  //  regulated stable coin. PAX is backed by US Dollar in equivalent 1:1.
  //  launched by Paxos Trust Company
  //  approved by the New York State Department of Financial Services
  {
    id: 5,
    name: 'Paxos Standard',
    symbol: 'PAX',
    decimals: 18,
    addressMainnet: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x8E870D67F660D95d5be530380D0eC0bd388289E1/logo.png`,
    address: TOKEN_5,
  },

  // Gemini dollar
  //  https://gemini.com/dollar/
  //  regulated by the New York State Department of Financial Services
  //  launched same day as PAX by Gemini Trust Company. backed by USD
  {
    id: 6,
    name: 'Gemini Dollar',
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
    id: 7,
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    addressMainnet: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359/logo.png`,
    address: TOKEN_7,
  },
]

export default tokens
