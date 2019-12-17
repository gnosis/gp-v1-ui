import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import { HeaderProps } from 'components/Layout/Header'
import { HeaderNavLinksInterface } from 'components/Layout/Header/Navigation'

const useNavigation = (initialState: HeaderProps['navigation'], responsive: boolean): HeaderNavLinksInterface[] => {
  const [navigationArray, setNavigationArray] = useState(initialState)
  const location = useLocation()

  useEffect(() => {
    if (responsive) {
      const smartNavArray = initialState.map((navObject, index) => {
        const editedHeaderValue = {
          ...navObject,
          order: location.pathname.includes(navObject.to) ? 0 : index + 1,
        }
        return editedHeaderValue
      })

      setNavigationArray(smartNavArray)
    }
  }, [initialState, location.pathname, responsive])

  return navigationArray
}

export default useNavigation
