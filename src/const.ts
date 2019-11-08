import BN from 'bn.js'

// Some convenient numeric constant
export const ZERO = new BN(0)
export const ONE = new BN(1)
export const TWO = new BN(2)
export const TEN = new BN(10)

// Max allowance value for ERC20 approve
export const ALLOWANCE_MAX_VALUE = new BN(2).pow(new BN(256)).sub(ONE) // 115792089237316195423570985008687907853269984665640564039457584007913129639935
// Arbitrarily big number for checking if the token is enabled
export const ALLOWANCE_FOR_ENABLED_TOKEN = new BN(2).pow(new BN(128)) // 340282366920938463463374607431768211456

// Model constants
export const FEE_DENOMINATOR = 1000 // Fee is 1/fee_denominator i.e. 1/1000 = 0.1%
export const BATCH_TIME = 300

// UI constants
export const HIGHLIGHT_TIME = 5000

export const LEGALDOCUMENT = {
  CONTACT_ADDRESS: '[INSERT ADDRESS]',
  POC_URL: '/',
  TITLE: 'We are in Beta - testing version on Rinkeby. Please click this banner to read the disclaimer.',
}

export const RESPONSIVE_SIZES = {
  MOBILE: 500,
}
