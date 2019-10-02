import { useState, useRef, useEffect } from 'react'

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
      }, 5000)
    }
  }

  return { highlight, triggerHighlight }
}
