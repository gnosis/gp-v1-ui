import { useEffect } from 'react'
import { useHistory } from 'react-router'

function useURLParams(newParams?: string): void {
  const history = useHistory()

  useEffect(() => {
    history.push(newParams)
  }, [history, newParams])
}

export default useURLParams
