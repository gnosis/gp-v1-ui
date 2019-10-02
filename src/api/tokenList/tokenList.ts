import { TokenDetails, Network } from 'types'

interface TokenDetailsByNetwork extends Omit<TokenDetails, 'address' | 'image'> {
  addressByNetwork: { [networkId: number]: string }
}

// Ether, Tether, TrueUSD, USD Coin, Paxos, Gemini, Dai
const tokens: TokenDetailsByNetwork[] = [
  // Wrapped Ether
  //  https://weth.io
  //  Wrapper of Ether to make it ERC-20 compliant
  //  Rinkeby faucet: https://faucet.rinkeby.io/
  {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    addressByNetwork: {
      [Network.Mainnet]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      [Network.Rinkeby]: '0xc778417e063141139fce010982780140aa0cd5ab',
    },
  },

  // Tether:
  //  https://tether.to/
  //  Fiat enabled collateralized stable coin, that is backed by the most popular fiat currency, USD (US Dollar) in a 1:1 ratio
  //  Rinkeby faucet: contract created with Team's shared account 0xf85D1a0E1b71e72013Db51139f285C6d5356B712.
  //    Use it to mint new tokens
  {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    addressByNetwork: {
      [Network.Mainnet]: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      [Network.Rinkeby]: '0xa9881E6459CA05d7D7C95374463928369cD7a90C',
    },
  },

  // TrueUSD
  //  https://www.trusttoken.com/trueusd
  //  US Dollar backed stable coin which is totally fiat-collateralized
  //  Rinkeby faucet: https://github.com/trusttoken/true-currencies#getting-testnet-tokens
  {
    name: 'TrueUSD',
    symbol: 'TUSD',
    decimals: 18,
    addressByNetwork: {
      [Network.Mainnet]: '0x0000000000085d4780B73119b644AE5ecd22b376',
      [Network.Rinkeby]: '0x0000000000085d4780B73119b644AE5ecd22b376',
    },
  },

  // USD Coin
  //  https://www.circle.com/en/usdc
  //  legitimate built on open standards
  //  using Grant Thornton for verifying Circle’s US dollar reserves
  //  launched by cryptocurrency finance firm circle Internet financial Ltd and the CENTRE open source consortium launched
  //  Rinkeby faucet: https://app.compound.finance/asset/cUSDC
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    addressByNetwork: {
      [Network.Mainnet]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      [Network.Rinkeby]: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
    },
  },

  // Paxos Standard (PAX)
  //  https://www.paxos.com/standard
  //  regulated stable coin. PAX is backed by US Dollar in equivalent 1:1.
  //  launched by Paxos Trust Company
  //  approved by the New York State Department of Financial Services
  //  Rinkeby faucet: contract created with Team's shared account 0xf85D1a0E1b71e72013Db51139f285C6d5356B712.
  //    Use it to mint new tokens
  {
    name: 'Paxos Standard',
    symbol: 'PAX',
    decimals: 18,
    addressByNetwork: {
      [Network.Mainnet]: '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
      [Network.Rinkeby]: '0xBD6A9921504fae42EaD2024F43305A8ED3890F6f',
    },
  },

  // Gemini dollar
  //  https://gemini.com/dollar/
  //  regulated by the New York State Department of Financial Services
  //  launched same day as PAX by Gemini Trust Company. backed by USD
  //  Rinkeby faucet: contract created with Team's shared account 0xf85D1a0E1b71e72013Db51139f285C6d5356B712.
  //    Use it to mint new tokens.
  //  Deployed contracts:
  //  - ERC20Store: 0xa0B87D97782E6767Eb6862208bc9c1283b8d79f6
  //  - ERC20Impl: 0x8d54C3af182A5ef4f74e7eCC07aB6182153797bB
  //  - ERC20Proxy (main interface): 0x784B46A4331f5c7C495F296AE700652265ab2fC6
  //  To mint new tokens:
  //  - Using ERC20Impl contract, call `requestPrint(address, amount)`
  //  - On same contract, use the `lockId` returned from previous call and execute `confirmPrint(lockId)`

  {
    name: 'Gemini dollar',
    symbol: 'GUSD',
    decimals: 2,
    addressByNetwork: {
      [Network.Mainnet]: '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
      [Network.Rinkeby]: '0x784B46A4331f5c7C495F296AE700652265ab2fC6',
    },
  },

  // MakerDAO (DAI)
  //  https://makerdao.com/
  //  crypto-collateralized cryptocurrency: stable coin which is pegged to USD
  //  Rinkeby faucet: https://app.compound.finance/asset/cDAI
  {
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    addressByNetwork: {
      [Network.Mainnet]: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
      [Network.Rinkeby]: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
    },
  },
]

export function getTokensByNetwork(networkId: number): TokenDetails[] {
  // Return token details
  const tokenDetails: (TokenDetails | null)[] = tokens.map(token => {
    const address = token.addressByNetwork[networkId]
    if (address) {
      // There's an address for the current network
      const { name, symbol, decimals } = token
      const addressMainnet = token.addressByNetwork[Network.Mainnet]

      return { name, symbol, decimals, address, addressMainnet }
    } else {
      return null
    }
  })

  // Return tokens with address for the current network
  return tokenDetails.filter(token => token != null)
}

export default tokens
