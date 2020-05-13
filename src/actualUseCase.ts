import { TcrApi } from 'api/tcr/TcrApi'

// src/const.ts
let ethNodeUrl
if (CONFIG.defaultProviderConfig.type === 'infura') {
  const { config } = CONFIG.defaultProviderConfig
  ethNodeUrl = config.infuraEndpoint + config.infuraId
} else if (CONFIG.defaultProviderConfig.type === 'url') {
  const { config } = CONFIG.defaultProviderConfig
  ethNodeUrl = config.ethNodeUrl
} else {
  throw new Error('Default provider URL is not set. Either provide ETH_NODE_URL env var or use the config.')
}
console.log('ethNodeUrl', ethNodeUrl)

// src/api/index.ts
function createTcrApi(): TcrApi | undefined {
  const { type } = CONFIG.tcr
  let tcrApi: TcrApi | undefined
  switch (CONFIG.tcr.type) {
    case 'none':
      tcrApi = undefined
      break
    case 'multi-tcr':
      const multiTcrApiConfig = CONFIG.tcr
      tcrApi = /* new MultiTcrApiProxy({ web3, ...multiTcrApiConfig.config }) */ multiTcrApiConfig as any
      break

    default:
      throw new Error('Unknown implementation for DexPriceEstimatorApi: ' + type)
  }

  window['tcrApi'] = tcrApi
  return tcrApi
}

createTcrApi()
