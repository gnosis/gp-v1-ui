import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

import Wallet, { WalletWrapper } from 'components/Wallet'
import { NavigationLinks, NavLinksWrapper } from './Navigation'

import { useNavigation, useOpenCloseNav } from './hooks'

import { APP_NAME } from 'const'

const HeaderWrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.2rem;

  nav {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    width: 92%;
  }

  .logo,
  ${WalletWrapper} {
    flex: 0 1 16rem;
  }

  .logo {
    order: 1;

    font-size: 1.8rem;
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
    flex: 0 1 45%;
    margin: auto;
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

  h3 {
    font-size: 2.2rem;
    margin: 0;
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
    ${WalletWrapper} {
      margin: 1rem auto;
    }
  }

  @media only screen and (max-width: 720px) {
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
        <Wallet />
      </nav>
    </HeaderWrapper>
  )
}

export default Header
