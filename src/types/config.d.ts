import { TheGraphApiImplParams } from 'api/thegraph/TheGraphApi'

export type MultiTcrConfig = {
  type: 'multi-tcr'
  config: MultiTcrApiParams
}

export type NoTcrConfig = {
  type: 'none'
}

export type MultiTcrConfig = {
  type: 'multi-tcr'
  config: MultiTcrApiParams
}

export type DexPriceEstimatimatorConfig = {
  type: 'dex-price-estimator'
  config: DexPriceEstimatimatorParams
}

export type TheGraphApiConfig = {
  type: 'the-graph'
  config: TheGraphApiImplParams
}

export interface Config {
  // name: string
  tcr: MultiTcrConfig | NoTcrConfig
  dexPriceEstimator: DexPriceEstimatimatorConfig
  theGraphApi: TheGraphApiConfig
}

declare let CONFIG: Config
