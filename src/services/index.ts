import { tokenListApi, exchangeApi, erc20Api, web3 } from 'api'

import {
  getTokenFromExchangeByAddressFactory,
  getTokenFromExchangeByIdFactory,
  addTokenToExchangeFactory,
} from './factories'

const apis = {
  tokenListApi,
  exchangeApi,
  erc20Api,
  web3,
}

export const getTokenFromExchangeByAddress = getTokenFromExchangeByAddressFactory(apis)

export const getTokenFromExchangeById = getTokenFromExchangeByIdFactory(apis)

export const addTokenToExchange = addTokenToExchangeFactory({ exchangeApi, erc20Api, web3 })
