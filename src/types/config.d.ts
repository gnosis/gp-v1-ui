interface NetworkIdBasedConfig<T> {
  [networkId: number]: T
}

export type TcrConfig = NetworkIdBasedConfig<{
  listId?: number
  contractAddress: string
}>

export type DexPriceEstimatorConfig = NetworkIdBasedConfig<string>

export type TheGraphApiConfig = NetworkIdBasedConfig<string>

export interface Config {
  tcr?: TcrConfig
  dexPriceEstimator: DexPriceEstimatorConfig
  theGraphApi: TheGraphApiConfig
}
