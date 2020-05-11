import { TheGraphApiImplParams } from 'api/thegraph/TheGraphApi'
import { MultiTcrApiParams } from 'api/tcr/MultiTcrApi'
import { DexPriceEstimatorParams } from 'api/dexPriceEstimator/DexPriceEstimatorApi'

export interface MultiTcrConfig {
  type: 'multi-tcr'
  config: Omit<MultiTcrApiParams, 'web3'>
}

export interface NoTcrConfig {
  type: 'none'
}

export interface DexPriceEstimatorConfig {
  type: 'dex-price-estimator'
  config: DexPriceEstimatorParams
}

export interface TheGraphApiConfig {
  type: 'the-graph'
  config: TheGraphApiImplParams
}

export interface InfuraProviderConfig {
  type: 'infura'
  config: { infuraId: string; infuraEndpoint: string }
}

export interface UrlProviderConfig {
  type: 'url'
  config: { ethNodeUrl: string }
}

export interface Config {
  name: string
  logoPath: string
  templatePath: string
  tcr: MultiTcrConfig | NoTcrConfig
  dexPriceEstimator: DexPriceEstimatorConfig
  theGraphApi: TheGraphApiConfig
  defaultProviderConfig: InfuraProviderConfig | UrlProviderConfig
}
