import { useMemo, useState } from 'react'
import { useLocation } from 'react-router'

import { HeaderProps } from 'components/Layout/Header'
import { HeaderNavLinksInterface } from 'components/Layout/Header/Navigation'

import useWindowSizes from 'hooks/useWindowSizes'

interface UseNavigationProps {
  navigationArray: HeaderNavLinksInterface[]
  handleLinkSelect: (key: string) => void
}

export const useNavigation = (initialState: HeaderProps['navigation'], responsive: boolean): UseNavigationProps => {
  const [navObject, setNavObject] = useState(initialState)
  const location = useLocation()

  useMemo(() => {
    if (responsive) {
      const smartNavObject = Object.keys(initialState).reduce((acc, key, index) => {
        const value = initialState[key]
        const editedHeaderValue = {
          ...value,
          order: location.pathname.search(key.toLowerCase()) === 1 ? 0 : index + 1,
        }
        const newAcc = {
          ...acc,
          [key]: { ...editedHeaderValue },
        }

        return newAcc
      }, {})

      setNavObject(smartNavObject)
    }
  }, [initialState, location.pathname, responsive])

  const navigationArray: HeaderNavLinksInterface[] = useMemo(
    () =>
      Object.keys(navObject).reduce((accum: HeaderNavLinksInterface[], currentKey) => {
        const navArray = [...accum, navObject[currentKey]]
        return navArray
      }, []),
    [navObject],
  )

  const handleLinkSelect = (key: string): void =>
    setNavObject(prevState => ({
      ...initialState,
      [key]: {
        ...prevState[key],
        order: 0,
      },
    }))

  return { navigationArray, handleLinkSelect }
}

export const useOpenCloseNav = (): {
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
