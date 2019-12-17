import { tokenListApi, exchangeApi, erc20Api, web3 } from 'api'

import { getTokenFromExchangeByAddressFactory, getTokenFromExchangeByIdFactory } from './getTokenFromExchange'
import { addTokenToExchangeFactory } from './addTokenToExchange'

const apis = {
  tokenListApi,
  exchangeApi,
  erc20Api,
  web3,
}

export const getTokenFromExchangeByAddress = getTokenFromExchangeByAddressFactory(apis)

export const getTokenFromExchangeById = getTokenFromExchangeByIdFactory(apis)

export const addTokenToExchange = addTokenToExchangeFactory({ exchangeApi, erc20Api, web3 })
