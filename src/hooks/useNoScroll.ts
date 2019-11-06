import { useEffect } from 'react'

const useNoScroll = (scrollCondition: boolean): void => {
  useEffect((): void => {
    const bodyClassList: string[] | DOMTokenList = (typeof window !== 'undefined' && document.body.classList) || []
    const noScrollActive = document.body.classList.contains('noScroll')

    if (noScrollActive && !scrollCondition) {
      ;(bodyClassList as DOMTokenList).remove('noScroll')
    } else if (!noScrollActive && scrollCondition) {
      ;(bodyClassList as DOMTokenList).add('noScroll')
    }
  }, [scrollCondition])
}

export default useNoScroll
