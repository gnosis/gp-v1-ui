import { MultiTcrConfig, DexPriceEstimatorConfig, TheGraphApiConfig, InfuraProviderConfig } from 'types/config'

describe('Test config defaults', () => {
  it('name', () => {
    expect(CONFIG.name).toEqual('Mesa - Gnosis Protocol DApp')
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
            contractAddress: '0x1854dae560abb0f399d8badca456663ca5c309d0',
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
          url: 'https://dex-price-estimator.gnosis.io',
        },
        {
          networkId: 4,
          url: 'https://dex-price-estimator.rinkeby.gnosis.io',
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
})
