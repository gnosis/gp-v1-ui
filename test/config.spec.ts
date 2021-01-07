import {
  MultiTcrConfig,
  DexPriceEstimatorConfig,
  TheGraphApiConfig,
  InfuraProviderConfig,
  ExchangeContractConfig,
} from 'types/config'
import { Network } from 'types'
import { MAX_APP_ID } from 'const'

describe('Test config defaults', () => {
  it('appId', () => {
    expect(CONFIG.appId).toEqual(expect.any(Number))
    expect(Number.isInteger(CONFIG.appId)).toBe(true)
    expect(CONFIG.appId).toBeGreaterThanOrEqual(1)
    expect(CONFIG.appId).toBeLessThanOrEqual(MAX_APP_ID)
  })

  it('name', () => {
    expect(CONFIG.name).toEqual('Gnosis Protocol v1 Web')
  })

  it('logoPath', () => {
    expect(CONFIG.logoPath).toEqual('./src/assets/img/logo.svg')
  })

  it('templatePath', () => {
    expect(CONFIG.templatePath).toEqual('./src/html/index.html')
  })

  it('tcr config', () => {
    const expected: MultiTcrConfig = {
      type: 'multi-tcr',
      config: {
        lists: [
          {
            networkId: 1,
            listId: 1,
            contractAddress: '0x93DB90445B76329e9ed96ECd74e76D8fbf2590d8',
          },
          {
            networkId: 4,
            contractAddress: '0xBb840456546496E7640DC09ba9fE06E67C157E1b',
          },
        ],
      },
    }

    expect(CONFIG.tcr).toEqual(expected)
  })

  it('dexPriceEstimator config', () => {
    const expected: DexPriceEstimatorConfig = {
      type: 'dex-price-estimator',
      config: [
        {
          networkId: 1,
          // eslint-disable-next-line @typescript-eslint/camelcase
          url_production: 'https://dex-price-estimator.gnosis.io',
          // eslint-disable-next-line @typescript-eslint/camelcase
          url_develop: 'https://price-estimate-mainnet.dev.gnosisdev.com',
        },
        {
          networkId: 4,
          // eslint-disable-next-line @typescript-eslint/camelcase
          url_production: 'https://dex-price-estimator.rinkeby.gnosis.io',
          // eslint-disable-next-line @typescript-eslint/camelcase
          url_develop: 'https://price-estimate-rinkeby.dev.gnosisdev.com',
        },
        {
          networkId: 100,
          // eslint-disable-next-line @typescript-eslint/camelcase
          url_production: 'https://dex-price-estimator.xdai.gnosis.io',
          // eslint-disable-next-line @typescript-eslint/camelcase
          url_develop: 'https://price-estimate-xdai.dev.gnosisdev.com',
        },
      ],
    }
    expect(CONFIG.dexPriceEstimator).toEqual(expected)
  })

  it('theGraphApi config', () => {
    const expected: TheGraphApiConfig = {
      type: 'the-graph',
      config: [
        {
          networkId: 1,
          url: 'https://api.thegraph.com/subgraphs/name/gnosis/protocol',
        },
        {
          networkId: 4,
          url: 'https://api.thegraph.com/subgraphs/name/gnosis/protocol-rinkeby',
        },
        {
          networkId: 100,
          url: 'https://api.thegraph.com/subgraphs/name/gnosis/protocol-xdai',
        },
      ],
    }
    expect(CONFIG.theGraphApi).toEqual(expected)
  })

  it('defaultProviderConfig', () => {
    const expected: InfuraProviderConfig = {
      type: 'infura',
      config: {
        infuraId: '607a7dfcb1ad4a0b83152e30ce20cfc5',
        infuraEndpoint: 'wss://mainnet.infura.io/ws/v3/',
      },
    }

    expect(CONFIG.defaultProviderConfig).toEqual(expected)
  })

  it('exchangeContractConfig', () => {
    const expected: ExchangeContractConfig = {
      type: 'contractBlock',
      config: [
        { networkId: 1, blockNumber: 9340147 },
        { networkId: 4, blockNumber: 5844678 },
        { networkId: 100, blockNumber: 11948310 },
      ],
    }
    expect(CONFIG.exchangeContractConfig).toEqual(expected)
  })

  it('disabledTokens', () => {
    const disabledTokensArray = expect.arrayContaining([
      expect.objectContaining({
        // required field
        address: expect.any(String),
      }),
    ])

    const {
      [Network.Mainnet]: disabledOnMainnet,
      [Network.Rinkeby]: disabledOnRinkeby,
      [Network.xDAI]: disabledOnXdai,
    } = CONFIG.disabledTokens

    if (disabledOnMainnet.length) expect(disabledOnMainnet).toEqual(disabledTokensArray)
    if (disabledOnRinkeby.length) expect(disabledOnRinkeby).toEqual(disabledTokensArray)
    if (disabledOnRinkeby.length) expect(disabledOnXdai).toEqual(disabledTokensArray)
  })

  it('initialTokenSelection', () => {
    const expectedTokenSelectionObject = {
      sellToken: expect.any(String),
      receiveToken: expect.any(String),
    }
    expect(CONFIG.initialTokenSelection).toEqual(expect.objectContaining(expectedTokenSelectionObject))

    const configNetworks = CONFIG.initialTokenSelection.networks
    Object.keys(configNetworks).forEach((networkKey) => {
      const networkSpecificSelection = configNetworks[networkKey]
      expect(networkKey).toEqual(expect.any(String))
      expect(networkSpecificSelection).toEqual(expect.objectContaining(expectedTokenSelectionObject))
    })
  })

  it('initialTokenList', () => {
    CONFIG.initialTokenList.map((token) =>
      expect(token).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          symbol: expect.any(String),
          decimals: expect.any(Number),
          addressByNetwork: expect.any(Object),
        }),
      ),
    )
  })
})
