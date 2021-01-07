import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { UNLIMITED_ORDER_AMOUNT } from '@gnosis.pm/dex-js'
export {
  UNLIMITED_ORDER_AMOUNT,
  FEE_DENOMINATOR,
  BATCH_TIME,
  MAX_BATCH_ID,
  FEE_PERCENTAGE,
  DEFAULT_DECIMALS as OLD_DEFAULT_DECIMALS,
  DEFAULT_PRECISION,
  ZERO,
  ONE,
  TWO,
  TEN,
  ALLOWANCE_MAX_VALUE,
  ALLOWANCE_FOR_ENABLED_TOKEN,
} from '@gnosis.pm/dex-js'
import { BATCH_TIME } from '@gnosis.pm/dex-js'
import { Network } from 'types'
import { DisabledTokensMaps, TokenOverride, AddressToOverrideMap } from 'types/config'

export const BATCH_TIME_IN_MS = BATCH_TIME * 1000
export const DEFAULT_TIMEOUT = 5000

export const ZERO_BIG_NUMBER = new BigNumber(0)
export const ONE_BIG_NUMBER = new BigNumber(1)
export const TEN_BIG_NUMBER = new BigNumber(10)
export const ONE_HUNDRED_BIG_NUMBER = new BigNumber(100)

// How much of the order needs to be matched to consider it filled
// Will divide the total sell amount by this factor.
// E.g.: Sell = 500; ORDER_FILLED_FACTOR = 100 (1%) => 500/100 => 5
// ∴ when the amount is < 5 the order will be considered filled.
export const ORDER_FILLED_FACTOR = new BN(10000) // 0.01%

export const BATCH_SUBMISSION_CLOSE_TIME = 4 // in minutes

export const MINIMUM_ALLOWANCE_DECIMALS = 10

// Max App Id: Read more here:
//    https://github.com/gnosis/gp-v1-ui/wiki/App-Ids-for-Forks
export const MAX_APP_ID = 255

export const APP_NAME = 'Gnosis Protocol v1 Web'

export const ETHER_PNG =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'

export const UNLIMITED_ORDER_AMOUNT_BIGNUMBER = new BigNumber(UNLIMITED_ORDER_AMOUNT.toString())
export const DEFAULT_ORDER_DURATION = 6 // every batch takes 5min, we want it to be valid for 30min, ∴ 30/5 == 6

// Placing FROM orders with validFrom === currentBatchId can fail if there's a new batch before the tx is mined.
// To address that, we are adding a small delay to guarantee it won't fail.
// For more info, see the issue https://github.com/gnosis/gp-v1-ui/issues/459 and
// the contract code https://github.com/gnosis/dex-contracts/blob/master/contracts/BatchExchange.sol#L557
export const BATCHES_TO_WAIT = 3

// How many orders should we query per call, when invoking https://github.com/gnosis/dex-contracts/blob/master/contracts/BatchExchange.sol#L479
export const DEFAULT_ORDERS_PAGE_SIZE = 50

// UI constants
export const HIGHLIGHT_TIME = 5000

export const TOAST_NOTIFICATION_DURATION = 10000 // in milliseconds

export const PRICE_ESTIMATION_DEBOUNCE_TIME = 200
export const DEFAULT_DECIMALS = 5
// The prices on the contract will update at max once every batch, which is 5min long
export const PRICES_CACHE_TIME = 60 // in seconds

export const ORDERBOOK_DATA_FETCH_DEBOUNCE_TIME = 200

export const MEDIA = {
  MOBILE_LARGE_PX: 500,
  tinyScreen: '320px',
  xSmallScreen: '430px',
  smallScreen: '736px',
  smallScreenUp: '737px',
  mediumScreenSmall: '850px',
  mediumEnd: '1024px',
  desktopScreen: '1025px',
  desktopScreenLarge: '1366px',
  get tinyDown(): string {
    return `only screen and (max-width : ${this.tinyScreen})`
  },
  get xSmallDown(): string {
    return `only screen and (max-width : ${this.xSmallScreen})`
  },
  get mobile(): string {
    return `only screen and (max-width : ${this.smallScreen})`
  },
  get mediumUp(): string {
    return `only screen and (min-width : ${this.smallScreenUp})`
  },
  get mediumDown(): string {
    return `only screen and (max-width : ${this.mediumEnd})`
  },
  get mediumOnly(): string {
    return `only screen and (min-width : ${this.smallScreenUp}) and (max-width : ${this.mediumEnd})`
  },
  get desktop(): string {
    return `only screen and (min-width : ${this.desktopScreen})`
  },
  get desktopLarge(): string {
    return `only screen and (min-width: ${this.desktopScreenLarge})`
  },
  get tabletPortrait(): string {
    return `(min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: portrait)`
  },
  get tabletLandscape(): string {
    return `(min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: landscape)`
  },
  get tablet(): string {
    return `(min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletPortrait}, ${this.tabletLandscape}`
  },
  get tabletNoPortrait(): string {
    return `(min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletLandscape}`
  },
  get tabletSmall(): string {
    return `(min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumScreenSmall})`
  },
}

export const ELLIPSIS = '...'

let infuraId
if (process.env.INFURA_ID) {
  infuraId = process.env.INFURA_ID
} else if (CONFIG.defaultProviderConfig.type === 'infura') {
  const { config } = CONFIG.defaultProviderConfig
  infuraId = config.infuraId
} else {
  infuraId = ''
}

export const INFURA_ID = infuraId
export const WALLET_CONNECT_BRIDGE = process.env.WALLET_CONNECT_BRIDGE || CONFIG.walletConnect.bridge
export const STORAGE_KEY_CUSTOM_WC_OPTIONS = 'CustomWCOptions'

let ethNodeUrl
if (process.env.ETH_NODE_URL) {
  ethNodeUrl = process.env.ETH_NODE_URL
} else if (CONFIG.defaultProviderConfig.type === 'infura') {
  const { config } = CONFIG.defaultProviderConfig
  ethNodeUrl = config.infuraEndpoint + config.infuraId
} else if (CONFIG.defaultProviderConfig.type === 'url') {
  const { config } = CONFIG.defaultProviderConfig
  ethNodeUrl = config.ethNodeUrl
} else {
  throw new Error('Default provider URL is not set. Either provide ETH_NODE_URL env var or use the config.')
}

export const ETH_NODE_URL = ethNodeUrl

export const STORAGE_KEY_LAST_PROVIDER = 'lastProvider'
export const STORAGE_KEY_DISABLED_TOKENS_ADDRESSES = 'disabledTokens'

export const TRADES_LOCAL_STORAGE_KEY = 'TRADES_PER_ACCOUNT'

const LIQUIDITY_TOKEN_LIST_VALUES = process.env.LIQUIDITY_TOKEN_LIST || 'USDT,TUSD,USDC,PAX,GUSD,DAI,sUSD'
export const LIQUIDITY_TOKEN_LIST = new Set(LIQUIDITY_TOKEN_LIST_VALUES.split(',').map((symbol) => symbol.trim()))
export const INPUT_PRECISION_SIZE = 6

export const WETH_ADDRESS_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
export const WETH_ADDRESS_RINKEBY = '0xc778417E063141139Fce010982780140Aa0cD5Ab'
export const WXDAI_ADDRESS_XDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
export const WETH_ADDRESS_XDAI = '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'

export const ORDER_BOOK_HOPS_MAX = 30

export const REFRESH_WHEN_SECONDS_LEFT = 60 // 1min before batch done
// for stable reference
// to avoid updates on setState([])
export const EMPTY_ARRAY = []

export const SLIPPAGE_MAP = new Map([
  ['0.1', false],
  ['0.5', true],
  ['1', false],
])
export const DEFAULT_SUGGESTED_SLIPPAGE = '0.5'
// Delay disabling loading indicators, since in a normal workflow, when a transaction is mined, the spinner is stopped,
// however, the new state, that flows top down once a bock is mined, can have a small delayed
// This delay mitigates the strange effect of stopping the loading before the data is updated
export const DISABLE_SPINNER_DELAY = 1000
export const DEFAULT_ORDERS_SORTABLE_TOPIC = 'validUntil'
/** ERROR CODES **/
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1474.md
export const LIMIT_EXCEEDED_ERROR_CODE = -32005

const { disabledTokens } = CONFIG

const DEFAULT_DISABLED_TOKEN_DESCRIPTION = 'This token is disabled for trading and depositing.'

export const DISABLED_TOKEN_MAPS = Object.keys(disabledTokens).reduce<DisabledTokensMaps>(
  (acc, networkId) => {
    const tokensList: TokenOverride[] | undefined = disabledTokens[networkId]
    if (!tokensList) {
      acc[networkId] = {}
      return acc
    }
    const tokensMap = tokensList.reduce<AddressToOverrideMap>((acc, token) => {
      if (!token.description) token.description = DEFAULT_DISABLED_TOKEN_DESCRIPTION
      acc[token.address] = token
      return acc
    }, {})

    acc[networkId] = tokensMap

    return acc
  },
  {
    [Network.Mainnet]: {},
    [Network.Rinkeby]: {},
    [Network.xDAI]: {},
  },
)
