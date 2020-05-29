import { logDebug } from 'utils/miscellaneous'

// TODO: can I make sure - using types - that headers length matches transformer return type length?
// Alternatively, I could make headers be the keys of a second type parameter
// which is the result of transformer, such as transformer<T, R>(item: T) => R[]
interface ToCsvParams<T> {
  headers?: string[]
  data: T[]
  transformer: (item: T) => string[]
}

/**
 * Util function that transforms given data and transformer function into a csv string,
 * taking care of escaping and error handling
 *
 * `headers` (optional). If present, length must match transformer return type length
 * `data` is a list of items to be converted to CSV by `transformer`
 * `transformer` is a function that receives the item and returns a list of strings
 */
export function toCsv<T>({ headers = [], data, transformer }: ToCsvParams<T>): string {
  return data
    .reduce(
      (acc, item) => {
        let values
        try {
          values = transformer(item)

          // Make sure the returned values match.
          console.assert(
            headers && values.length !== headers.length,
            `Values length (${values.length}) doesn't match headers length ${headers.length}`,
          )
        } catch (e) {
          logDebug(`[utils:toCsv] Not able to transform into csv: ${item}`, e)
          return acc
        }
        const csvRow = values
          .map(value => {
            // " is a string delimeter
            // if already included in e.g. symbol
            // must be replaced by double ""
            value = value.replace(/"/g, '""')

            // if there's a field delimeter comma in e.g. symbol or date
            // need to enclose whole string in quotes
            if (value.includes(',')) value = `"${value}"`
            return value
          })
          .join(',')

        acc.push(csvRow)

        return acc
      },
      [headers.join(',')],
    )
    .join('\n')
}
