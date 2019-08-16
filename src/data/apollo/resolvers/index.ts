import { merge } from 'lodash'

import web3Resolvers, { defaults as web3State } from './web3'
import providerResolvers, { defaults as providerState } from './provider'

const allResolvers = merge(web3Resolvers, providerResolvers)

export const defaultState = merge(web3State, providerState)
console.log('TCL: defaultState', defaultState)
export default allResolvers
