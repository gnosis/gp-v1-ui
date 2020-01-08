import { addSeconds } from 'date-fns'

interface CacheObj<O> {
  obj: O
  createdOn: Date
}

export class CacheProxy<T> {
  protected api: T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cache: { [hash: string]: CacheObj<any> }

  public constructor(api: T) {
    this.api = api
    this.cache = {}
  }

  /**
   * Returns value from cache for given `hash`.
   * Cache behaviour is given by `expiration` property:
   *  0: return cache if found == cache forever
   *  number: return cache if found and cache younger than now + `expiration` seconds
   */
  private get<R>(hash: string, expiration: number): R | undefined {
    const cacheObj = this.cache[hash]

    if (!cacheObj) {
      // there's no cache
      return
    }

    if (expiration > 0) {
      const validUntil = addSeconds(new Date(), expiration)

      if (cacheObj.createdOn > validUntil) {
        // the cache is expired
        return
      }
    }

    // cache was found
    console.debug(`cache hit for ${hash}`)
    return cacheObj.obj
  }

  private store<O>(hash: string, obj: O): void {
    this.cache[hash] = { obj, createdOn: new Date() }
  }

  protected async fetchWithCache<P, R, M = keyof T>(method: M, params: P, expiration?: number): Promise<R> {
    const methodName = String(method)
    const hash = this.hashParams(methodName, params)

    let value: R | undefined

    if (expiration !== undefined) {
      value = this.get<R>(hash, expiration)

      if (value) {
        // cache is enabled and we found a value
        return value
      }
    }

    value = await this.api[methodName](params)

    this.store(hash, value)

    return value as R
  }
  /**
   * Dumb hash function that simply glues together paramName:paramValue
   * Assumes all values being hashed can be converted to string
   * Sorts parameters for determinism
   *
   * TODO: replace this with an actual hash function once testing is done
   *
   * @param params The params we want to hash
   *
   */
  private hashParams<P>(methodName: string, params: P): string {
    return Object.keys(params)
      .sort()
      .reduce((acc, key) => `${acc}|${key}:${params[key]}`, methodName)
  }
}
