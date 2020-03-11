import { Command } from 'types'

export const MEDIA_QUERY_MATCHES = [
  // must be in descending order for .find to match from largest to smallest
  // as sm will also match for xl and lg, for example
  {
    name: 'xl',
    query: '(min-width:1200px)',
  },
  {
    name: 'lg',
    query: '(min-width:992px)',
  },
  {
    name: 'md',
    query: '(min-width:768px)',
  },
  {
    name: 'sm',
    query: '(min-width:576px)',
  },
  // anything smaller -- xs
]

const DEFAULT_QUERY_NAME = 'xs'

export const getMatchingScreenSize = (): string =>
  MEDIA_QUERY_MATCHES.find(({ query }) => window.matchMedia(query).matches)?.name || DEFAULT_QUERY_NAME

export const MEDIA_QUERIES = MEDIA_QUERY_MATCHES.map(({ query }) => query)
export const MEDIA_QUERY_NAMES = MEDIA_QUERY_MATCHES.map(({ name }) => name).concat(DEFAULT_QUERY_NAME)

export const subscribeToScreenSizeChange = (callback: (event: MediaQueryListEvent) => void): Command => {
  const mediaQueryLists = MEDIA_QUERIES.map(query => window.matchMedia(query))

  mediaQueryLists.forEach(mql => mql.addListener(callback))

  return (): void => mediaQueryLists.forEach(mql => mql.removeListener(callback))
}
