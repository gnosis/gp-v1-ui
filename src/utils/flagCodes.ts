// gasstation return example
/*{
  lastUpdate: '2020-03-03T11:23:53.500017Z',
  lowest: '1000000001',
  safeLow: '6000000001',
  standard: '10000000001',
  fast: '18800000001',
  fastest: '1457792372351',
} */
// can in most cases safely override 9 last digits
// even 10 digits if only using standard price

export interface Flag<T extends string> {
  name: T
  values: string[] // value at 0-index is the default
  meaningfulDigits: number
}

// OUR specific flags
const SENTINEL = '12'

type DxFlagName = 'provider' | 'mobile' | 'browser'

// Providers currently detected by web3connect
// new provider names can be appended to values as long as values.length - 1 <= meaningfulDigits
const provider: Flag<DxFlagName> = {
  name: 'provider',
  values: [
    'Web3', // generic name for undetected provider
    'MetaMask',
    'Safe',
    'Nifty',
    'Dapper',
    'Opera',
    'Trust',
    'Coinbase',
    'Cipher',
    'imToken',
    'Status',
    'Tokenary',
    'WalletConnect',
  ],
  meaningfulDigits: 2,
}

const mobile: Flag<DxFlagName> = {
  name: 'mobile',
  values: ['desktop', 'mobile'],
  meaningfulDigits: 1,
}

// Browsers currently detected by detect-browser
// new browser names can be appended to values as long as values.length - 1 <= meaningfulDigits
const browser: Flag<DxFlagName> = {
  name: 'browser',
  values: [
    'unknown',
    'aol',
    'edge',
    'edge-ios',
    'yandexbrowser',
    'vivaldi',
    'kakaotalk',
    'samsung',
    'silk',
    'miui',
    'beaker',
    'edge-chromium',
    'chromium-webview',
    'chrome',
    'phantomjs',
    'crios',
    'firefox',
    'fxios',
    'opera-mini',
    'opera',
    'ie',
    'bb10',
    'android',
    'ios',
    'safari',
    'facebook',
    'instagram',
    'ios-webview',
    'searchbot',
  ],
  meaningfulDigits: 2,
}

const FLAGS: Flag<DxFlagName>[] = [provider, mobile, browser]

