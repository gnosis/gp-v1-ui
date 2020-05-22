import { useEffect } from 'react'
import { useHistory } from 'react-router'

function useURLParams(newParams?: string, replace = false): void {
  const history = useHistory()

  useEffect(() => {
    if (newParams) {
      history[replace ? 'replace' : 'push'](newParams)
    }
  }, [history, newParams, replace])
}

export default useURLParams
