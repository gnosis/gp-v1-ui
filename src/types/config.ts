import { TheGraphApiImplParams } from 'api/thegraph/TheGraphApi'
import { MultiTcrApiParams } from 'api/tcr/MultiTcrApi'
import { DexPriceEstimatorParams } from 'api/dexPriceEstimator/DexPriceEstimatorApi'

export type MultiTcrConfig = {
  type: 'multi-tcr'
  config: Omit<MultiTcrApiParams, 'web3'>
}

export type NoTcrConfig = {
  type: 'none'
}

export type DexPriceEstimatorConfig = {
  type: 'dex-price-estimator'
  config: DexPriceEstimatorParams
}

export type TheGraphApiConfig = {
  type: 'the-graph'
  config: TheGraphApiImplParams
}

export interface Config {
  // name: string
  tcr: MultiTcrConfig | NoTcrConfig
  dexPriceEstimator: DexPriceEstimatorConfig
  theGraphApi: TheGraphApiConfig
}
