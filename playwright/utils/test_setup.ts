import { chromium, ChromiumBrowser, Page, BrowserContext } from 'playwright'
export let browser: ChromiumBrowser
export let context: BrowserContext
export let page: Page

export const baseURL = process.env.BASE_URL || 'http://localhost:8080'

// PWDEBUG is playwright specific flag
// sets up window.playwright and other stuff
const isDebug = !!process.env.PWDEBUG
let slowMo: number | undefined

// timeout to have time to account for async nature of browser actions
jest.setTimeout(15000)
if (isDebug) {
  // slow down playright actions
  slowMo = 2000
} else {
  // close after only when not debugging
  afterAll(() => browser.close())
  afterEach(() => page.close())
}

beforeAll(async () => {
  // launch chrome,headless by default
  browser = await chromium.launch({ slowMo })
  context = await browser.newContext()
})
beforeEach(async () => {
  // new page per test
  page = await context.newPage()
})
