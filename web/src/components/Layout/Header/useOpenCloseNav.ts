import { useState, useMemo } from 'react'

import useWindowSizes from 'hooks/useWindowSizes'

const useOpenCloseNav = (): {
  isResponsive: boolean
  openNav: boolean
  setOpenNav: (action: boolean) => void
} => {
  const [openNav, setOpenNav] = useState(false)

  const { innerWidth } = useWindowSizes()
  const isResponsive = !!(innerWidth && innerWidth < 720)
  useMemo(() => {
    if (openNav && !isResponsive) {
      setOpenNav(false)
    }
  }, [isResponsive, openNav])

  return { isResponsive, openNav, setOpenNav }
}

export default useOpenCloseNav
