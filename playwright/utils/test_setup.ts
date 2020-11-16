import { chromium, ChromiumBrowser, Page, BrowserContext } from 'playwright'
// export let browser: ChromiumBrowser
// export let context: BrowserContext
// export let page: Page

export const baseURL = process.env.BASE_URL || 'http://localhost:8080'

const isDebug = !!process.env.PWDEBUG
console.log('isDebug', isDebug)
// let slowMo: number | undefined = undefined

// timeout to have time to account for async nature of browser actions
// jest.setTimeout(15000)
// if (isDebug) {
//   // slow down playwright actions
//   slowMo = 2000
// } else {
//   // close after only when not debugging
//   afterAll(() => browser.close())
//   afterEach(() => page.close())
// }

// beforeAll(async () => {
//   console.log('BROWSER SETUP')
//   // launch chrome,headless by default
//   browser = await chromium.launch({ slowMo })
//   context = await browser.newContext()
// })
// beforeEach(async () => {
//   console.log('PAGE SETUP')
//   // new page per test
//   page = await context.newPage()
// })

export interface PlaywrightTestVariables {
  browser: ChromiumBrowser
  context: BrowserContext
  page: Page
}

export type VariablesAssignmentCallback = (vars: PlaywrightTestVariables) => void

export const setupTests = (callback: VariablesAssignmentCallback): void => {
  let browser: ChromiumBrowser
  let context: BrowserContext
  let page: Page

  let slowMo: number | undefined

  // timeout to have time to account for async nature of browser actions
  jest.setTimeout(15000)
  if (isDebug) {
    // slow down playwright actions
    slowMo = 2000
  } else {
    // close after only when not debugging
    afterAll(() => browser.close())
    afterEach(() => page.close())
  }

  beforeAll(async () => {
    console.log('BROWSER SETUP')
    // launch chrome,headless by default
    browser = await chromium.launch({ slowMo })
    context = await browser.newContext()

    // assign
    callback({
      browser,
      context,
      page,
    })
  })
  beforeEach(async () => {
    console.log('PAGE SETUP')
    // new page per test
    page = await context.newPage()

    // assign
    callback({
      browser,
      context,
      page,
    })
  })
}
