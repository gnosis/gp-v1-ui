import { CacheProxy } from 'api/proxy'

interface TestApi {
  cachedMethod(params: Params): Promise<string>
  syncCachedMethod(params: Params): string
  customHashFn(params: Params): Promise<string>
  nonCachedMethod(params: Params): Promise<string>
}

interface Params {
  p: string
}

class TestApiImpl implements TestApi {
  public async cachedMethod({ p }: Params): Promise<string> {
    return p
  }
  public syncCachedMethod({ p }: Params): string {
    return p
  }
  public async customHashFn(params: Params): Promise<string> {
    return this.cachedMethod(params)
  }
  public async nonCachedMethod(params: Params): Promise<string> {
    return this.cachedMethod(params)
  }
}

class TestApiProxy extends CacheProxy<TestApi> implements TestApi {
  public cachedMethod(params: Params): Promise<string> {
    return this.fetchWithCache('cachedMethod', params, 10)
  }
  public syncCachedMethod(params: Params): string {
    return this.fetchWithCache('syncCachedMethod', params)
  }
  public customHashFn(params: Params): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.fetchWithCache('customHashFn', params, undefined, (..._params: any[]): string => 'always the same lol')
  }
  public nonCachedMethod(params: Params): Promise<string> {
    return this.api.nonCachedMethod(params)
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

  it('caching works as well for sync methods', () => {
    const syncSpy = jest.spyOn(api, 'syncCachedMethod')

    const firstValue = instance.syncCachedMethod({ p })
    const secondValue = instance.syncCachedMethod({ p })

    expect(syncSpy).toHaveBeenCalledTimes(1)
    expect(firstValue).toEqual(secondValue)
  })

  it('uses custom hash function', async () => {
    spy = jest.spyOn(api, 'customHashFn')

    const firstValue = await instance.customHashFn({ p })
    const secondValue = await instance.customHashFn({ p: 'something else' })

    // the custom hash function provided always hash to the same key, so doesn't matter the params,
    // the return should always be the result of the first invocation
    expect(spy).toHaveBeenCalledTimes(1)
    expect(firstValue).toEqual(secondValue)
    expect(secondValue).toBe(p)
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
