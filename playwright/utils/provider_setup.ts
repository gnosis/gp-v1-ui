import path from 'path'
import Web3EthAccounts, { Accounts as AccountsType } from 'web3-eth-accounts'

import { setupTests } from './test_setup'
import { compileInjects, fileExists } from './build_injects'
import { BrowserContext } from 'playwright'

// get connection data from CONFIG
const { config } = CONFIG.defaultProviderConfig
const providerURL = 'ethNodeUrl' in config ? config.ethNodeUrl : 'https://rinkeby.infura.io/v3/' + config.infuraId
console.log('url', providerURL)

declare global {
  interface Window {
    injectProvider: (params: { pk: string; url: string }) => void
  }
}

// const Web3EthAccounts:  = ActualAccounts

const accountCreator = new ((Web3EthAccounts as unknown) as typeof AccountsType)()
// random account, {address, privateKey, sign, signTransaction,...}
export const account = accountCreator.create()

// beforeAll(async () => {
//   console.log('PROVIDER SETUP')
//   // only rebuild when no file found
//   // or when passed PWREBUILD=1 env var
//   if (process.env.PWREBUILD || !(await fileExists(path.resolve(__dirname, '../build/inject_provider.js')))) {
//     await compileInjects()
//   }

//   await context.addInitScript({
//     path: path.resolve(__dirname, '../build/inject_provider.js'),
//   })

//   await context.addInitScript(
//     (providerParams: { pk: string; url: string }) => {
//       window.injectProvider(providerParams)
//     },
//     { pk: account.privateKey, url: providerURL },
//   )
// })

export const setupProvider: typeof setupTests = (callback) => {
  let context: BrowserContext

  setupTests((variables) => {
    ;({ context } = variables)

    // assignment
    callback(variables)
  })

  beforeAll(async () => {
    console.log('PROVIDER SETUP')
    // only rebuild when no file found
    // or when passed PWREBUILD=1 env var
    console.log('process.env.PWREBUILD ', process.env.PWREBUILD)
    if (process.env.PWREBUILD || !(await fileExists(path.resolve(__dirname, '../build/inject_provider.js')))) {
      await compileInjects()
    }

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
}
