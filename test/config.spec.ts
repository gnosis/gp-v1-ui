describe('get config', () => {
  it('tcr config has the expected defaults', () => {
    expect(CONFIG.tcr).toEqual({
      type: 'multi-tcr',
      config: [
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
    })
  })

  it('dexPriceEstimator config has the expected defaults', () => {
    expect(CONFIG.dexPriceEstimator).toEqual({
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
    })
  })

  it('theGraphApi config has the expected defaults', () => {
    expect(CONFIG.theGraphApi).toEqual({
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
    })
  })
})
