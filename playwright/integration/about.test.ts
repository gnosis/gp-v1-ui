import { chromium, ChromiumBrowser, Page } from 'playwright'
let browser: ChromiumBrowser
let page: Page

const baseURL = process.env.BASE_URL || 'http://localhost:8080 '
  afterAll(() => browser.close())
  afterEach(() => page.close())
beforeAll(async () => {
  // launch chrome,headless by default
  browser = await chromium.launch({ slowMo })
})
beforeEach(async () => {
  // new page per test
  page = await browser.newPage()
})

