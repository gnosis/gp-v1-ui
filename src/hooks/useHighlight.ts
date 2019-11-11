import { useState, useRef, useEffect } from 'react'
import { HIGHLIGHT_TIME } from 'const'

interface Result {
  highlight: boolean
  triggerHighlight(): void
}

export const useHighlight = (): Result => {
  const [highlight, setHighlight] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    return function cleanUp(): void {
      mounted.current = false
    }
  }, [])

  const triggerHighlight = (): void => {
    if (mounted.current) {
      setHighlight(true)
      setTimeout(() => {
        if (mounted.current) {
          setHighlight(false)
        }
      }, HIGHLIGHT_TIME)
    }
  }

  return { highlight, triggerHighlight }
}
