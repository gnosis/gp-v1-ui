const { chromium } = require('playwright')
// const Web3 = require('web3')
const webpack = require('webpack')
const path = require('path')
const compiler = webpack({
  entry: './playwright/inject_provider.js',
  output: {
    path: path.resolve(__dirname, './playwright/build/'),
    filename: 'inject_provider.js',
  },
  cache: true,
})

;(async () => {
  await new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error)
      }

      resolve(stats)
    })
  })
  const browser = await chromium.launch({
    headless: false,
  })
  const context = await browser.newContext()

  // Open new page
  const page = await context.newPage()

  // window.ethereum = {
  //   request(request) {
  //     if (request.method === 'eth_accounts') return [account]

  //     if (request.method === 'eth_chainId') return '0x4'
  //   },
  //   enable() {
  //     return [account]
  //   },
  // }

  await page.addInitScript({
    path: './playwright/init/inject_provider.js',
  })

  await page.addInitScript((pk) => {
    // async function injectProvider() {
    //   await import('https://unpkg.com/web3@1.3.0/dist/web3.min.js')
    //   /** @type typeof import('web3').default */
    //   const Web3 = window.Web3
    //   const web3 = new Web3('https://rinkeby.infura.io/v3/3c9b697bcf414df8b2e59f7f5523a93a')
    //   web3.eth.accounts.wallet.add(pk)

    //   window.web3 = web3
    //   window.ethereum = web3.currentProvider
    //   // window.ethereum = new HDWalletProvider({
    //   //   privateKeys: [pk],
    //   //   providerOrUrl: 'https://rinkeby.infura.io/v3/4bf032f2d38a4ed6bb975b80d6340847',
    //   // })
    // }
    // injectProvider()

    window.injectProvider({
      pk,
      url: 'https://rinkeby.infura.io/v3/3c9b697bcf414df8b2e59f7f5523a93a',
    })
  }, '0xad20c82497421e9784f18460ad2fe84f73569068e98e270b3e63743268af5763')

  // Go to http://localhost:8081/
  await page.goto('http://localhost:8081/')

  // Go to http://localhost:8081/trade/USDC-DAI?sell=0&price=0
  await page.goto('http://localhost:8081/trade/USDC-DAI?sell=0&price=0')

  // Go to http://localhost:8081/trade/USDC-DAI?sell=0&price=0&from=&expires=
  await page.goto('http://localhost:8081/trade/USDC-DAI?sell=0&price=0&from=&expires=')

  // Click text=/.*Connect Wallet.*/
  await page.click('text=/.*Connect Wallet.*/')

  await page.click('text=/.*Web3.*/')
  // Close page
  // await page.close()

  // // ---------------------
  // await context.close()
  // await browser.close()
})()
