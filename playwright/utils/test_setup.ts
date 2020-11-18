import {
  chromium,
  firefox,
  webkit,
  ChromiumBrowser,
  FirefoxBrowser,
  WebKitBrowser,
  BrowserType,
  Page,
  BrowserContext,
} from 'playwright'
import { assert } from '@gnosis.pm/dex-js'
export let browser: ChromiumBrowser | FirefoxBrowser | WebKitBrowser
export let context: BrowserContext
export let page: Page

export const baseURL = process.env.BASE_URL || 'http://localhost:8080'

const availableBrowsers: Record<string, BrowserType<ChromiumBrowser | FirefoxBrowser | WebKitBrowser>> = {
  chromium,
  firefox,
  webkit,
}

const browserFlag = process.env.BROWSER

assert(
  !browserFlag || browserFlag in availableBrowsers,
  `unsupported environment variable BROWSER=${browserFlag}. Use ${Object.keys(availableBrowsers).join(', ')}`,
)

const browserType = browserFlag ? availableBrowsers[browserFlag] : chromium

const executablePath = process.env.EXECUTABLE_PATH

// PWDEBUG is playwright specific flag
// sets up window.playwright and other stuff
const isDebug = !!process.env.PWDEBUG
let slowMo: number | undefined

// timeout to have time to account for async nature of browser actions
jest.setTimeout(30000)
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
  browser = await browserType.launch({ slowMo, executablePath })
  context = await browser.newContext()
})
beforeEach(async () => {
  // new page per test
  page = await context.newPage()
})
