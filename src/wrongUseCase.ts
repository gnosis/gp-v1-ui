import { TcrApi } from 'api/tcr/TcrApi'

// src/api/index.ts
function createTcrApi(): TcrApi | undefined {
  const tcr = CONFIG.tcr
  const { type } = tcr
  let tcrApi: TcrApi | undefined
  switch (tcr.type) {
    case 'none':
      tcrApi = undefined
      break
    case 'multi-tcr':
      const multiTcrApiConfig = tcr
      tcrApi = /* new MultiTcrApiProxy({ web3, ...multiTcrApiConfig.config }) */ multiTcrApiConfig as any
      break

    default:
      throw new Error('Unknown implementation for DexPriceEstimatorApi: ' + type)
  }

  window['tcrApi'] = tcrApi
  return tcrApi
}

createTcrApi()
