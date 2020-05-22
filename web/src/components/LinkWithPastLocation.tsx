import React, { useMemo } from 'react'
import { useLocation } from 'react-router'
import { LinkProps, NavLink } from 'react-router-dom'
import { Location, LocationDescriptorObject } from 'history'

// LinkProps.to can be a string, a Location object or a function returning the first two
type LocationTo = LinkProps['to']

// handle string or Location object
const constructLocationObject = (to: Exclude<LocationTo, Function>, location: Location): LocationDescriptorObject => {
  if (typeof to === 'string')
    return {
      pathname: to,
      state: { from: location },
    }

  return {
    ...to,
    state: { ...to.state, from: location },
  }
}

export const usePastLocation = (to: LocationTo): LocationTo => {
  const location = useLocation()

  return useMemo(() => {
    if (typeof to === 'function')
      // higher-order function to reprocess a constructed Location string or object
      return (location: Location): LocationDescriptorObject => {
        const newLocation = to(location)

        return constructLocationObject(newLocation, location)
      }

    return constructLocationObject(to, location)
  }, [to, location])
}

const LinkWithPastLocation: React.FC<LinkProps> = props => {
  const to = usePastLocation(props.to)

  return <NavLink {...props} to={to} />
}

export default LinkWithPastLocation
