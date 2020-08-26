import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

import { useTokenList } from 'hooks/useTokenList'

const mockStablecoinList = [
  {
    // USD coins
    priority: 1,
    addresses: {
      1: [
        '0x9999999999999999999999999999999999999992', // USDT
        '0x9999999999999999999999999999999999999993', // USDC
        '0x9999999999999999999999999999999999999994', // DAI
        '0x9999999999999999999999999999999999999995', // TUSD
        '0x9999999999999999999999999999999999999996', // PAX
        '0x4Fabb145d64652a948d72533023f6E7A623C7C53', // BUSD
      ],
      // Rinkeby
      4: [],
    },
  },
  {
    // non-USD stablecoins
    priority: 2,
    addresses: {
      1: [
        '0x9999999999999999999999999999999999999997', // EURS
        '0x2c537e5624e4af88a7ae4060c022609376c8d0eb', // TRYB
        '0xc9a2c4868f0f96faaa739b59934dc9cb304112ec', // GBP
        '0xa689dcea8f7ad59fb213be4bc624ba5500458dc6', // EBASE
        '0x9999999999999999999999999999999999999991', // DZAR
        '0x1fc31488f28ac846588ffa201cde0669168471bd', // UAX
      ],
      // Rinkeby
      4: [],
    },
  },
  {
    // WETH
    priority: 3,
    addresses: {
      1: [
        '0x9999999999999999999999999999999999999998', // WETH
      ],
      // Rinkeby
      4: [],
    },
  },
]

const expectedData = [
  {
    id: 1,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    addressMainnet: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    address: '0x9999999999999999999999999999999999999991',
    priority: 2,
  },
  {
    id: 2,
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    addressMainnet: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    address: '0x9999999999999999999999999999999999999992',
  },
  {
    id: 3,
    name: 'TrueUSD',
    symbol: 'TUSD',
    decimals: 18,
    addressMainnet: '0x0000000000085d4780B73119b644AE5ecd22b376',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0000000000085d4780B73119b644AE5ecd22b376/logo.png',
    address: '0x9999999999999999999999999999999999999993',
  },

  {
    id: 4,
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    addressMainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    address: '0x9999999999999999999999999999999999999994',
    priority: 1,
  },
]

const TestScrollComponent: React.FC<{}> = () => {
  const tokenList = useTokenList({
    networkId: 1,
    quoteTokenPrioritiesList: mockStablecoinList,
    excludeDeprecated: true,
  })

  const [WETH, USDT, TUSD, USDC] = tokenList
  return (
    <div>
      <span>{WETH.priority}</span>
      <strong>{USDT.address}</strong>
      <p>{TUSD.symbol}</p>
      <small>{USDC.priority}</small>
    </div>
  )
}

let container: HTMLDivElement | null

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  container && document.body.removeChild(container)

  container = null
})

it('can render and show proper text', () => {
  const [WETH, USDT, TUSD, USDC] = expectedData

  // Test first render and effect
  act(() => {
    ReactDOM.render(<TestScrollComponent />, container)
  })

  // WETH
  expect(container?.querySelector('span')?.textContent).toBe(WETH.priority?.toString())
  // USDT
  expect(container?.querySelector('strong')?.textContent).toBe(USDT.address.toString())
  // TUSD
  expect(container?.querySelector('p')?.textContent).toBe(TUSD.symbol.toString())
  // USDC
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expect(container?.querySelector('small')?.textContent).toBe(USDC.priority!.toString())
})
