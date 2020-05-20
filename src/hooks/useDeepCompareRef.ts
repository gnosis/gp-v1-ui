import { useRef } from 'react'
import { isDeepEqual } from 'utils'

function useDeepCompareRef(value: undefined): undefined
function useDeepCompareRef<R>(value: R): R
function useDeepCompareRef<R>(value?: R): R | undefined {
  const ref = useRef<R | undefined>()

  if (!isDeepEqual(value, ref.current)) {
    ref.current = value
  }

  return ref.current
}

export default useDeepCompareRef
