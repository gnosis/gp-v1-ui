import React from 'react'
import { useLocation } from 'react-router'
import { Link, LinkProps } from 'react-router-dom'

interface StateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any
}

interface Props extends LinkProps<StateProps> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  to: any
}

const LinkWithPastLocation: React.FC<Props> = props => {
  const location = useLocation()
  const to =
    typeof props.to === 'string'
      ? { pathname: props.to, state: { from: location } }
      : { ...props.to, state: { ...props.to.state, from: location } }

  return <Link {...props} to={to} />
}

export default LinkWithPastLocation
