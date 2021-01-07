import { page, baseURL } from '../utils/test_setup'

describe('About', () => {
  it('Page has expected title', async () => {
    // GIVEN: At home page
    await page.goto(baseURL)

    // THEN: page has title
    expect(await page.title()).toBe('Gnosis Protocol v1 Web')
  })

  it('Navigates from link in the footer', async () => {
    // GIVEN: At home page
    await page.goto(baseURL)

    // WHEN: Click on the "About" link in the footer
    // can use css-selector + xpath syntax, with >> in-between
    await page.click('footer >> "About"') // inside footer element with textContent='About'

    // THEN: We navigate to the about page
    expect(page.url()).toContain('/about')
  })

  it('Navigates using URL', async () => {
    // GIVEN: about page
    await page.goto(baseURL + '/about')

    // WHEN: heading is awailable
    const headingText = await page.textContent('main h1:first-child')

    // THEN: There's the heading we expect
    expect(headingText).toContain('About Gnosis Protocol v1 Web')
  })
})
