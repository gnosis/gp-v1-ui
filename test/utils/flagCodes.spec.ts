import { encoderFactory, decoderFactory, Flag } from 'utils'
import { earmarkGasPrice } from 'api/gasStation'

describe('flagCodes', () => {
  const flagA: Flag<'flagA'> = {
    name: 'flagA',
    values: ['A1', 'A2'],
    meaningfulDigits: 1,
  }

  const flagB: Flag<'flagB'> = {
    name: 'flagB',
    values: ['B1', 'B2'],
    meaningfulDigits: 2,
  }

  const sentinel = 'SEN'

  describe('encoder', () => {
    it('encodes one flag with meaningfulDigits = 1', () => {
      const encoder = encoderFactory({
        sentinel,
        flags: [flagA],
      })

      const encoded = encoder({
        flagA: 'A1',
      })

      expect(encoded).toEqual('SEN0')
    })
    it('encodes one flag with meaningfulDigits = 2', () => {
      const encoder = encoderFactory({
        sentinel,
        flags: [flagB],
      })

      const encoded = encoder({
        flagB: 'B2',
      })

      expect(encoded).toEqual('SEN01')
    })
    it('encodes multiple flags', () => {
      const encoder = encoderFactory({
        sentinel,
        flags: [flagA, flagB],
      })

      const encoded = encoder({
        flagA: 'A2',
        flagB: 'B1',
      })

      expect(encoded).toEqual('SEN100')
    })
    it('defaults to 0', () => {
      const encoder = encoderFactory({
        sentinel,
        flags: [flagA],
      })

      const encoded = encoder({
        flagA: 'NO_SUCH_FLAG_VALUE',
      })

      expect(encoded).toEqual('SEN0')
    })
    it('encodes without sentinel', () => {
      const encoder = encoderFactory({
        flags: [flagA, flagB],
      })

      const encoded = encoder({
        flagA: 'A1',
        flagB: 'B2',
      })

      expect(encoded).toEqual('001')
    })
    it('throws for empty flags array', () => {
      expect(() => encoderFactory({ flags: [] })).toThrow('Flags array must not be empty')
    })
  })

  describe('decoder', () => {
    it('decodes one flag with meaningfulDigits = 1', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagA],
      })

      const decoded = decoder('SEN0')

      expect(decoded).toEqual({
        flagA: 'A1',
      })
    })
    it('decodes one flag with meaningfulDigits = 2', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagB],
      })

      const decoded = decoder('SEN01')

      expect(decoded).toEqual({
        flagB: 'B2',
      })
    })
    it('decodes multiple flags', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagA, flagB],
      })

      const decoded = decoder('SEN100')

      expect(decoded).toEqual({
        flagA: 'A2',
        flagB: 'B1',
      })
    })
    it('decodes without sentinel', () => {
      const decoder = decoderFactory({
        flags: [flagA, flagB],
      })

      const decoded = decoder('001')

      expect(decoded).toEqual({
        flagA: 'A1',
        flagB: 'B2',
      })
    })
    it('throws for empty flags array', () => {
      expect(() => decoderFactory({ flags: [] })).toThrow('Flags array must not be empty')
    })
    it('decodes accounting for prefix and postfix', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagA, flagB],
        prefix: '^prefix\\d+',
        postfix: 'postfix$',
      })

      const decoded = decoder('prefix123SEN100postfix')

      expect(decoded).toEqual({
        flagA: 'A2',
        flagB: 'B1',
      })
    })
    it('returns null when prefix mismatches', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagA, flagB],
        prefix: '^prefix\\d+',
        postfix: 'postfix$',
      })

      const decoded = decoder('0xprefix123SEN100postfix')

      expect(decoded).toBeNull()
    })
    it('returns null when postfix mismatches', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagA, flagB],
        prefix: '^prefix\\d+',
        postfix: 'postfix$',
      })

      const decoded = decoder('prefix123SEN100fixpost')

      expect(decoded).toBeNull()
    })
    it('returns null when sentinel mismatches', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagA, flagB],
        prefix: '^prefix\\d+',
        postfix: 'postfix$',
      })

      const decoded = decoder('prefix123NY100postfix')

      expect(decoded).toBeNull()
    })
    it('returns null when flag is not a number', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagA, flagB],
        prefix: '^prefix\\d+',
        postfix: 'postfix$',
      })

      const decoded = decoder('prefix123SEN1FLpostfix')

      expect(decoded).toBeNull()
    })
    it('returns null when number of flags mismatches', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagA, flagB],
        prefix: '^prefix\\d+',
        postfix: 'postfix$',
      })

      expect(decoder('prefix123SEN10070102postfix')).toBeNull()
      expect(decoder('prefix123SEN1postfix')).toBeNull()
    })
    it('returns null when a flag number > possible flag values', () => {
      const decoder = decoderFactory({
        sentinel,
        flags: [flagA, flagB],
        prefix: '^prefix\\d+',
        postfix: 'postfix$',
      })

      const decoded = decoder('prefix123SEN102postfix') // 02 >= flagB.values.length

      expect(decoded).toBeNull()
    })
  })
})
