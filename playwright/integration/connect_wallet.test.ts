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
    // XPATH: most specific element with textContent starting with 0x and >= address.length
    // matches account address inside Wallet popup
    const textWithAddress = await page.textContent(
      '(//html/body//*[starts-with(.,"0x") and string-length(.)>=42])[last()]',
    )

    expect(textWithAddress).toContain(account.address)
  })
})
