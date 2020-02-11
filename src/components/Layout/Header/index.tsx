import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

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

const TopWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
`

const BatchCountDown = styled.div`
  display: flex;
  order: 2;
`

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
        <TopWrapper>
          {/* USER WALLET */}
          <UserWallet />
          {/* Global Batch Countdown */}
          <BatchCountDown>Next batch in: <strong>4m 12s</strong></BatchCountDown>
        </TopWrapper>
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
