import BigNumber from 'bignumber.js'
import { UNLIMITED_ORDER_AMOUNT } from '@gnosis.pm/dex-js'
export {
  UNLIMITED_ORDER_AMOUNT,
  FEE_DENOMINATOR,
  BATCH_TIME,
  MAX_BATCH_ID,
  FEE_PERCENTAGE,
  DEFAULT_DECIMALS,
  DEFAULT_PRECISION,
} from '@gnosis.pm/dex-js'
export { ZERO, ONE, TWO, TEN, ALLOWANCE_MAX_VALUE, ALLOWANCE_FOR_ENABLED_TOKEN } from '@gnosis.pm/dex-js'
export const APP_NAME = 'fuse'

export const ETHER_PNG =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'

export const UNLIMITED_ORDER_AMOUNT_BIGNUMBER = new BigNumber(UNLIMITED_ORDER_AMOUNT.toString())
export const DEFAULT_ORDER_DURATION = 6 // every batch takes 5min, we want it to be valid for 30min, ∴ 30/5 == 6

// Placing FROM orders with validFrom === currentBatchId can fail if there's a new batch before the tx is mined.
// To address that, we are adding a small delay to guarantee it won't fail.
// For more info, see the issue https://github.com/gnosis/dex-react/issues/459 and
// the contract code https://github.com/gnosis/dex-contracts/blob/master/contracts/BatchExchange.sol#L557
export const BATCHES_TO_WAIT = 3

// How many orders should we query per call, when invoking https://github.com/gnosis/dex-contracts/blob/master/contracts/BatchExchange.sol#L479
export const DEFAULT_ORDERS_PAGE_SIZE = 50

// UI constants
export const HIGHLIGHT_TIME = 5000

export const TOAST_NOTIFICATION_DURATION = 10000 // in milliseconds

export const LEGALDOCUMENT = {
  CONTACT_ADDRESS: '[INSERT ADDRESS]',
  POC_URL: '/',
  TITLE: 'We are in Beta - testing version on Rinkeby. Please click this banner to read the disclaimer.',
}

export const RESPONSIVE_SIZES = {
  // PX SIZES:
  MOBILE_SMALL_PX: 320,
  MOBILE_PX: 500,
  MOBILE_LARGE_PX: 532,
  TABLET_PX: 720,
  TABLET_LARGE_PX: 866,
  WEB_SMALL_PX: 1024,

  // EM SIZES:
  MOBILE_SMALL: 20,
  MOBILE: 31.25,
  MOBILE_LARGE: 33.25,
  TABLET: 45,
  TABLET_LARGE: 54.125,
  WEB_SMALL: 64,
  WEB: 75,
}

export const ELLIPSIS = '...'
// TODO change infuraID for production
export const INFURA_ID = '8b4d9b4306294d2e92e0775ff1075066'
export const INITIAL_INFURA_ENDPOINT = `wss://rinkeby.infura.io/ws/v3/${INFURA_ID}`

export const STORAGE_KEY_LAST_PROVIDER = 'lastProvider'

export const GP_ORDER_TX_HASHES = {
  1: 'GP_ORDER_TX_HASHES_1',
  4: 'GP_ORDER_TX_HASHES_4',
}
