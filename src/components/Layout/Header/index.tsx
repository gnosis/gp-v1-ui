import React from 'react'
import { NavLink } from 'react-router-dom'

import UserWallet from 'components/UserWallet'
import { NavigationLinks } from './Navigation'
import { HeaderWrapper } from './Header.styled'

import useNavigation from './useNavigation'
import useOpenCloseNav from './useOpenCloseNav'

import { APP_NAME } from 'const'

export interface HeaderProps {
  [key: string]: {
    label: string
    to: string
    order: number
    withPastLocation?: boolean
  }[]
}

const Header: React.FC<HeaderProps> = ({ navigation: initialState }: HeaderProps) => {
  const { isResponsive, openNav, setOpenNav } = useOpenCloseNav()
  const navigationArray = useNavigation(initialState, isResponsive)

  const handleOpenNav = (): void | false => isResponsive && setOpenNav(!openNav)

  return (
    <HeaderWrapper>
      <nav>
        {/* LOGO */}
        {/* <NavLink className="logo" to="/order">
          {APP_NAME}
        </NavLink> */}
        {/* USER WALLET */}
        <UserWallet />
        {/* HEADER LINKS */}
        <NavigationLinks
          navigation={navigationArray}
          responsive={isResponsive}
          handleOpenNav={handleOpenNav}
          showNav={openNav}
        />
      </nav>
    </HeaderWrapper>
  )
}

export default Header
