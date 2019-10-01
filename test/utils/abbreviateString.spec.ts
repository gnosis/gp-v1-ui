import { abbreviateString } from 'utils'

describe('Edge cases', () => {
  test('3 char string, 1 prefix is unchanged', async () => {
    expect(abbreviateString('abc', 1)).toEqual('abc')
  })

  test('4 char string, 1 prefix abbreviates', async () => {
    expect(abbreviateString('abcd', 1)).toEqual('a...')
  })

  test('4 char string, 2 prefix is unchanged', async () => {
    expect(abbreviateString('abcd', 2)).toEqual('abcd')
  })

  test('5 char string, 1 prefix, 1 suffix is abbreviated', async () => {
    expect(abbreviateString('abcde', 1, 1)).toEqual('a...e')
  })

  test('5 char string, 2 prefix, 1 suffix is unchanged', async () => {
    expect(abbreviateString('abcde', 2, 1)).toEqual('abcde')
  })

  test('5 char string, 1 prefix, 2 suffix is unchanged', async () => {
    expect(abbreviateString('abcde', 1, 2)).toEqual('abcde')
  })

  test('5 char string, 0 prefix, 1 suffix is abbreviated', async () => {
    expect(abbreviateString('abcde', 0, 1)).toEqual('a...e')
  })
})
