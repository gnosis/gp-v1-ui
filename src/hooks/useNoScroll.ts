import { useEffect } from 'react'

const useNoScroll = (scrollCondition: boolean): void => {
  useEffect((): void => {
    if (typeof document === 'undefined') return

    const noScrollActive = document.body.classList.contains('noScroll')

    if (noScrollActive && !scrollCondition) {
      document.body.classList.remove('noScroll')
    } else if (!noScrollActive && scrollCondition) {
      document.body.classList.add('noScroll')
    }
  }, [scrollCondition])
}

export default useNoScroll
