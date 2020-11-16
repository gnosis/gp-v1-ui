import { baseURL } from '../utils/test_setup'
import { account, setupProvider } from '../utils/provider_setup'
import { Page } from 'playwright'

let page: Page

setupProvider((variables) => {
  ;({ page } = variables)
})

describe('Connect Wallet', () => {
  it('Can connect a Wallet', async () => {
    // GIVEN: At home page
    await page.goto(baseURL)

    // WHEN: connected a Wallet
    // Click text=/.*Connect Wallet.*/
    await page.click('text=/.*Connect Wallet.*/')

    await page.click('text=Web3')

    // WHEN: Wallet popup is open
    await page.click('header >> text=Web3')

    // THEN: wallet connected & address available
    // XPATH: closest ancestor with 0x* text of element with text "Copy address to clipboard"
    const textWithAddress = await page.textContent(
      '//*[text()="Copy address to clipboard"]//ancestor::*[starts-with(., "0x")][1]',
    )

    expect(textWithAddress).toContain(account.address)
  })
})
