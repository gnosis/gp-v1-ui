import React from 'react'
import { NavLink } from 'react-router-dom'

import UserWallet from 'components/UserWallet'
import { NavigationLinks } from './Navigation'
import { HeaderWrapper } from './Header.styled'

import { useNavigation, useOpenCloseNav } from './hooks'

import { APP_NAME } from 'const'

export interface HeaderProps {
  navigation: {
    [key: string]: {
      label: string
      to: string | Location
      order: number
      withPastLocation?: boolean
    }
  }
}

const Header: React.FC<HeaderProps> = ({ navigation: initialState }: HeaderProps) => {
  const { isResponsive, openNav, setOpenNav } = useOpenCloseNav()
  const { navigationArray, handleLinkSelect } = useNavigation(initialState, isResponsive)

  const handleOpenNav = (): void | false => isResponsive && setOpenNav(!openNav)

  return (
    <HeaderWrapper>
      <nav>
        {/* LOGO */}
        <NavLink className="logo" to="/trade">
          {APP_NAME}
        </NavLink>
        {/* HEADER LINKS */}
        <NavigationLinks
          navigation={navigationArray}
          responsive={isResponsive}
          handleLinkSelect={handleLinkSelect}
          handleOpenNav={handleOpenNav}
          showNav={openNav}
        />
        {/* USER WALLET */}
        <UserWallet />
      </nav>
    </HeaderWrapper>
  )
}

export default Header
