import { useMemo } from 'react'
import useSafeState from './useSafeState'

interface SortTopic {
  topic: string
  order: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useSortByTopic<T>(
  data: T[],
  defaultTopic: string,
): { sortTopic: SortTopic; setSortTopic: React.Dispatch<React.SetStateAction<SortTopic>> } {
  // true == 'asc' && false == 'dsc'
  const [sortTopic, setSortTopic] = useSafeState<SortTopic>({ topic: defaultTopic, order: true })

  useMemo(() => {
    if (sortTopic) {
      data.sort((lhs, rhs) =>
        sortTopic.order ? lhs[sortTopic.topic] - rhs[sortTopic.topic] : rhs[sortTopic.topic] - lhs[sortTopic.topic],
      )
    }
  }, [data, sortTopic])

  return { sortTopic, setSortTopic }
}

export default useSortByTopic
