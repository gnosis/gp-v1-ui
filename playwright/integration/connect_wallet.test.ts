import { page, baseURL } from '../utils/test_setup'
import { account } from '../utils/provider_setup'

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
    //                          XPATH:    closest div ancestor of element with text "Copy address to clipboard"
    const textWithAddress = await page.textContent('//*[text()="Copy address to clipboard"]//ancestor::div[1]')

    expect(textWithAddress).toContain(account.address)
  })
})
