export interface TcrConfig {
  [networkId: number]: {
    listId?: number
    contractAddress: string
  }
}

export interface Config {
  tcr?: TcrConfig
}
