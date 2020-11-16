import webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import Web3EthAccounts, { Accounts as AccountsType } from 'web3-eth-accounts'

import { context } from './test_setup'

// get connection data from CONFIG
const { config } = CONFIG.defaultProviderConfig
const providerURL = 'ethNodeUrl' in config ? config.ethNodeUrl : 'https://rinkeby.infura.io/v3/' + config.infuraId
console.log('url', providerURL)

const fileExists = (path: string): Promise<boolean> => {
  return fs.promises.access(path).then(
    () => true,
    () => false,
  )
}

const compileInjects = async (): Promise<void> => {
  console.log('process.env.REBUILD_PW', process.env.REBUILD_PW)
  // only rebuild when no file found
  // or when passed REBUILD_PW=1 env var
  if (!process.env.REBUILD_PW && (await fileExists(path.resolve(__dirname, '../build/inject_provider.js')))) {
    return
  }

  console.log('path.resolve', path.resolve(__dirname, '../build/'))
  const compiler = webpack({
    entry: path.resolve(__dirname, '../inject_provider.js'),
    output: {
      path: path.resolve(__dirname, '../build/'),
      filename: 'inject_provider.js',
    },
    cache: true,
  })

  await new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      console.log('error', error)
      if (error) {
        return reject(error)
      }

      resolve(stats)
    })
  })
}

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
  await compileInjects()

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
