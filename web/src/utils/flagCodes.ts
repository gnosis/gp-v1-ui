import { MEDIA_QUERY_NAMES } from './mediaQueries'

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

type DxFlagName = 'provider' | 'mobile' | 'browser' | 'screenSize'

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
    'unknown', // generic name for undetected browser
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

const screenSize: Flag<DxFlagName> = {
  name: 'screenSize',
  values: MEDIA_QUERY_NAMES,
  // [xl, lg, md, sm, xs]
  meaningfulDigits: 1,
}

const FLAGS: Flag<DxFlagName>[] = [provider, mobile, browser, screenSize]

// GENERIC flag functions

type FlagValueType = Flag<never>['values'][number]

type FlagValuesObject<T extends string> = Record<T, FlagValueType>

// Encoder

interface EncoderFactoryInput<T extends string> {
  sentinel?: string
  flags: Flag<T>[]
}

export type Encoder<T extends string> = (flagValues: FlagValuesObject<T>) => string

type FlagMap = {
  [K in FlagValueType]: number
}

// maps flag.values to flag.map<{[K in flag.values]: flag.values.indexOf(K)}>
// end up with {'desktop': 0, 'mobile': 1} like mapping for O(1) lookup
const mapValuesToId = (array: FlagValueType[]): FlagMap => {
  return array.reduce<FlagMap>((accum, val, index) => {
    accum[val] = index
    return accum
  }, {})
}

// creates and encoder for given sentinel and flags
// encoder accepts object of {flag => flag value} and produces encoded string
export const encoderFactory = <T extends string>({ sentinel = '', flags }: EncoderFactoryInput<T>): Encoder<T> => {
  if (flags.length === 0) throw new Error('Flags array must not be empty')

  const flagsWithMaps = flags.map(({ values, ...rest }) => ({
    ...rest,
    map: mapValuesToId(values),
  }))

  return (flagValues): string => {
    return (
      sentinel +
      flagsWithMaps
        .map(flag => {
          const detectedValue = flagValues[flag.name]
          // if detected as a value not already in flags.values, default to 0 index
          const flagValueIndex = flag.map[detectedValue] ?? 0

          return String(flagValueIndex).padStart(flag.meaningfulDigits, '0')
        })
        .join('')
    )
  }
}

// Decoder

interface DecoderFactoryInput<T extends string> extends EncoderFactoryInput<T> {
  prefix?: string
  postfix?: string
}

type DecodedFlags<T extends string> = {
  [K in T]: FlagValueType
}

export type Decoder<T extends string> = (code: string) => DecodedFlags<T> | null

// creates and decoder for given sentinel, flags and optionally prefix and postfix
// decoder accepts an encoded string (encoded by encoder from encoderFactory)
// and produces an object of {flag => flag value} or null if unable to decode
export const decoderFactory = <T extends string>({
  sentinel = '',
  flags,
  prefix = '',
  postfix = '',
}: DecoderFactoryInput<T>): Decoder<T> => {
  if (flags.length === 0) throw new Error('Flags array must not be empty')

  const pattern = prefix + sentinel + flags.map(flag => `(\\d{${flag.meaningfulDigits}})`).join('') + postfix
  const regexp = new RegExp(pattern)

  return (code): DecodedFlags<T> | null => {
    const match = code.match(regexp)

    if (!match) return null

    const result = {} as DecodedFlags<T>

    for (let i = 0; i < flags.length; ++i) {
      const group = match[i + 1]

      if (!group) return null

      const flag = flags[i]
      const number = Number(group)
      // if number isn't a valid flag
      // short-circuit return
      if (number >= flag.values.length) return null

      result[flag.name] = flag.values[number]
    }

    return result
  }
}

// OUR encoder and decoder

export const gasPriceEncoder = encoderFactory({ sentinel: SENTINEL, flags: FLAGS })

export const gasPriceDecoder = decoderFactory({ sentinel: SENTINEL, flags: FLAGS, prefix: '\\d+', postfix: '$' })
