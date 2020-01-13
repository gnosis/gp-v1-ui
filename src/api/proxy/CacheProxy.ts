import NodeCache from 'node-cache'

export class CacheProxy<T> {
  protected api: T
  private cache: NodeCache

  public constructor(api: T) {
    this.api = api
    this.cache = new NodeCache({ useClones: false })
  }

  private get<R>(hash: string): R | undefined {
    const obj = this.cache.get(hash)

    if (obj) {
      console.debug(`cache hit for ${hash}`)
      return obj as R
    }

    return
  }

  private store<O>(hash: string, obj: O, expiration?: number): void {
    if (expiration) {
      // with TTL
      this.cache.set(hash, obj, expiration)
    } else {
      // based on default config
      this.cache.set(hash, obj)
    }
  }

  protected fetchWithCache<P, R, M = keyof T>(
    method: M,
    params: P,
    expiration?: number,
    hashFn?: (method: string, params: P) => string,
  ): R {
    const methodName = String(method)
    const hash = hashFn ? hashFn(methodName, params) : this.hashParams(methodName, params)

    let value = this.get<R>(hash)

    if (value) {
      return value
    }

    value = this.api[methodName](params)

    this.store(hash, value, expiration)

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
