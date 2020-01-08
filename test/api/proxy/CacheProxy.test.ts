import { CacheProxy } from 'api/proxy'

interface TestApi {
  cachedMethod(params: Params): Promise<string>
  nonCachedMethod(params: Params): Promise<string>
}

interface Params {
  p: string
}

class TestApiImpl implements TestApi {
  public async cachedMethod({ p }: Params): Promise<string> {
    return p
  }
  public async nonCachedMethod(params: Params): Promise<string> {
    return this.cachedMethod(params)
  }
}

class TestApiProxy extends CacheProxy<TestApi> implements TestApi {
  public async cachedMethod(params: Params): Promise<string> {
    return this.fetchWithCache('cachedMethod', params, 10)
  }
  public async nonCachedMethod(params: Params): Promise<string> {
    return this.fetchWithCache('nonCachedMethod', params)
  }
}

let api: TestApi
let instance: TestApiProxy
let spy: jest.SpyInstance<Promise<string>, [Params]>

beforeEach(() => {
  api = new TestApiImpl()
  instance = new TestApiProxy(api)
})

afterEach(() => {
  spy.mockReset()
})

const p = 'parameter'

describe('With cache', () => {
  it('calls original api when parameters are different', async () => {
    spy = jest.spyOn(api, 'cachedMethod')

    const firstValue = await instance.cachedMethod({ p })
    const secondValue = await instance.cachedMethod({ p: 'different value' })
    expect(spy).toHaveBeenCalledTimes(2)
    expect(firstValue).not.toEqual(secondValue)
  })

  it('finds cache on second invocation with same parameters', async () => {
    spy = jest.spyOn(api, 'cachedMethod')

    const firstValue = await instance.cachedMethod({ p })
    const secondValue = await instance.cachedMethod({ p })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(firstValue).toEqual(secondValue)
  })
})

describe('Without cache', () => {
  it('calls original api multiple times when no cache is set', async () => {
    spy = jest.spyOn(api, 'nonCachedMethod')

    expect(await instance.nonCachedMethod({ p })).toMatch(p)
    expect(await instance.nonCachedMethod({ p })).toMatch(p)
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
