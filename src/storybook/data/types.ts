import { WithAddress, WithDecimals, WithId, WithSymbolAndName } from '@gnosis.pm/dex-js'
import { Network } from 'types'

export type NetworkMap = Record<keyof typeof Network, Network>
export type DefaultTokenDetails = Required<WithId & WithSymbolAndName & WithAddress & WithDecimals>
