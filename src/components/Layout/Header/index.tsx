import React, { useState } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

import Wallet, { WalletWrapper } from 'components/Wallet'
import { NavigationLinks, NavLinksWrapper } from './Navigation'

import useWindowSizes from 'hooks/useWindowSizes'
import useNavigation from './useNavigation'

import { APP_NAME } from 'const'

const HeaderWrapper = styled.header`
  padding: 1rem 2rem;

  nav {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    @media only screen and (max-width: 866px) {
      justify-content: center;
    }
  }

  .logo,
  ${WalletWrapper} {
    flex: 0.2 1 16rem;
  }

  .logo {
    order: 1;

    font-size: 2.8rem;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;

    padding: 0.5rem;
    margin: 0.5rem;

    &:hover {
      color: var(--color-text-secondary);
      cursor: pointer;
    }
  }

  ${NavLinksWrapper} {
    order: 2;
    flex: 1 1 50%;
  }

  ${WalletWrapper} {
    order: 3;
  }

  .header-title {
    margin: 0 auto;
    line-height: 1.15;
    text-align: center;
    width: 95%;

    h1 {
      margin: 0;
    }
  }

  h1 {
    margin-bottom: 0;
    color: #e0e1e2;
    font-size: 3em;

    em {
      font-size: 1.2em;
      color: #ff62a2;
    }
  }
  h2 {
    margin-top: 1em;
    text-transform: uppercase;
    color: white;
    font-size: 0.8em;
  }

  @media only screen and (max-width: 1024px) {
    .logo {
      display: none;
    }
  }

  @media only screen and (max-width: 850px) {
    nav {
      flex-flow: row wrap;
    }
  }

  @media only screen and (max-width: 720px) {
    padding-bottom: 1rem;

    .logo,
    .nav-links,
    ${WalletWrapper} {
      padding: 0.25rem;
    }

    ${NavLinksWrapper} {
      flex: 1 1 100%;
      order: 1;

      a {
        padding: 5px;
      }
    }
  }
`

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
  const [openNav, setOpenNav] = useState(false)

  const { innerWidth } = useWindowSizes()
  const isReponsive = !!(innerWidth && innerWidth < 720)

  const { navigationArray, handleLinkSelect } = useNavigation(initialState, isReponsive)

  const handleOpenNav = (): void => setOpenNav(!openNav)

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
          responsive={!!(innerWidth && innerWidth < 720)}
          handleLinkSelect={handleLinkSelect}
          handleOpenNav={handleOpenNav}
          showNav={openNav}
        />
        {/* USER WALLET */}
        <Wallet />
      </nav>
    </HeaderWrapper>
  )
}

export default Header
