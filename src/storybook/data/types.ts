import { Network } from 'types'
import { TokenDetails } from 'types'

export type NetworkMap = Record<keyof typeof Network, Network>
export type DefaultTokenDetails = Required<Pick<TokenDetails, 'id' | 'name' | 'symbol' | 'address' | 'decimals'>>
