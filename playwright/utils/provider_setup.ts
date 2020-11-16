import webpack from 'webpack'
import path from 'path'
import Web3EthAccounts, { Accounts as AccountsType } from 'web3-eth-accounts'

import { context } from './test_setup'

// get connection data from CONFIG
const { config } = CONFIG.defaultProviderConfig
const providerURL = 'ethNodeUrl' in config ? config.ethNodeUrl : 'https://rinkeby.infura.io/v3/' + config.infuraId
console.log('url', providerURL)

console.log('path.resolve', path.resolve(__dirname, '../build/'))
const compiler = webpack({
  entry: path.resolve(__dirname, '../inject_provider.js'),
  output: {
    path: path.resolve(__dirname, '../build/'),
    filename: 'inject_provider.js',
  },
  cache: true,
})

declare global {
  interface Window {
    injectProvider: (params: { pk: string; url: string }) => void
  }
}

// const Web3EthAccounts:  = ActualAccounts

const accountCreator = new ((Web3EthAccounts as unknown) as typeof AccountsType)()

export const account = accountCreator.create()

beforeAll(async () => {
  console.log('PROVIDER SETUP')
  await new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      console.log('error', error)
      if (error) {
        return reject(error)
      }

      resolve(stats)
    })
  })

  await context.addInitScript({
    path: path.resolve(__dirname, '../build/inject_provider.js'),
  })

  await context.addInitScript(
    (providerParams: { pk: string; url: string }) => {
      window.injectProvider(providerParams)
    },
    { pk: account.privateKey, url: providerURL },
  )
})
