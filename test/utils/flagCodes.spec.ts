import { encoderFactory, decoderFactory, Flag } from 'utils'

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

})
