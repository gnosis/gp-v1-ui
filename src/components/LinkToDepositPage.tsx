import React from 'react'
import { useLocation } from 'react-router'
import { Link } from 'react-router-dom'

const LinkToDepositPage: React.FC = ({ children }) => {
  const location = useLocation()
  const to = {
    pathname: '/deposit',
    state: { from: location }, // storing current location params (url + search) for restoring them later
  }

  return <Link to={to}>{children ? children : 'Deposit'}</Link>
}

export default LinkToDepositPage
