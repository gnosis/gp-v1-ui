import { useMemo, useState } from 'react'
import { useLocation } from 'react-router'

import { HeaderProps } from 'components/Layout/Header'
import { HeaderNavLinksInterface } from 'components/Layout/Header/Navigation'

interface UseNavigationProps {
  navigationArray: HeaderNavLinksInterface[]
  handleLinkSelect: (key: string) => void
}

const useNavigation = (initialState: HeaderProps['navigation'], responsive: boolean): UseNavigationProps => {
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

export default useNavigation
