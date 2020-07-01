import { TheGraphApiImplParams } from 'api/thegraph/TheGraphApi'
import { MultiTcrApiParams } from 'api/tcr/MultiTcrApi'
import { DexPriceEstimatorParams } from 'api/dexPriceEstimator/DexPriceEstimatorApi'
import { Network } from 'types'

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

export interface WalletConnectConfig {
  bridge: string
}

// potentially other reasons
export type OverrideReason = 'DEPRECATED'

export interface TokenOverride {
  address: string
  symbol?: string
  name?: string
  reason?: OverrideReason
  description?: string
}

export interface DisabledTokens {
  [Network.Mainnet]: TokenOverride[]
  [Network.Rinkeby]: TokenOverride[]
}

export interface Config {
  name: string
  logoPath: string
  templatePath: string
  tcr: MultiTcrConfig | NoTcrConfig
  dexPriceEstimator: DexPriceEstimatorConfig
  theGraphApi: TheGraphApiConfig
  defaultProviderConfig: InfuraProviderConfig | UrlProviderConfig
  walletConnect: WalletConnectConfig
  disabledTokens: DisabledTokens
}

export interface AddressToOverrideMap {
  [key: string]: TokenOverride | undefined
}

export interface DisabledTokensMaps {
  [k: number]: AddressToOverrideMap | undefined
}
