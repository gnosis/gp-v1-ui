import { useMemo } from 'react'
import { noop } from 'utils'

interface HookReturn {
  handleLongPress: () => boolean
  handleClearTimeout: () => void
}

function useLongPress(clickHandler: Function = noop): HookReturn {
  return useMemo(() => {
    let pressTimer: NodeJS.Timeout
    return {
      handleLongPress: (): boolean => {
        clearTimeout(pressTimer)
        pressTimer = setTimeout(function() {
          clickHandler()
        }, 1000)
        return false
      },
      handleClearTimeout: (): void => clearTimeout(pressTimer),
    }
  }, [clickHandler])
}

export default useLongPress
