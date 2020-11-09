import { chromium, ChromiumBrowser, Page } from 'playwright'
let browser: ChromiumBrowser
let page: Page

const baseURL = process.env.BASE_URL || 'http://localhost:8080 '
const isDebug = !!process.env.PWDEBUG
let slowMo: number | undefined = undefined

if (isDebug) {
  // timeout to have time to look around in the browser
  jest.setTimeout(15000)
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
})
beforeEach(async () => {
  // new page per test
  page = await browser.newPage()
})

describe('About', () => {
  it('Page has expected title', async () => {
    // GIVEN: At home page
    await page.goto(baseURL)

    // THEN: page has title
    expect(await page.title()).toBe('Gnosis Protocol Web')
  })

  it('Navigates from link in the footer', async () => {
    // GIVEN: At home page
    await page.goto(baseURL)

    // WHEN: Click on the "About" link in the footer
    // can use css-selector + xpath syntax, with >> in-between
    await page.click('footer >> text=About') // inside footer element with textContent='About'

    // THEN: We navigate to the about page
    expect(page.url()).toContain('/about')
  })

  it('Navigates using URL', async () => {
    // GIVEN: about page
    await page.goto(baseURL + '/about')

    // WHEN: heading is awailable
    const headingText = await page.textContent('main h1:first-child')

    // THEN: There's the heading we expect
    expect(headingText).toContain('About Gnosis Protocol Web')
  })
})
