import React from 'react'
import styled from 'styled-components'

// Assets
import LogoImage from 'assets/img/logo-v2.svg'
import PortfolioImage from 'assets/img/portfolio.svg'
import PortfolioImageWhite from 'assets/img/portfolio-white.svg'
import SettingsImage from 'assets/img/settings.svg'
import SettingsImageWhite from 'assets/img/settings-white.svg'
import NotificationsImage from 'assets/img/bell.svg'
import NotificationsImageWhite from 'assets/img/bell-white.svg'

// Components
import UserWallet from 'components/UserWalletTrading'

const HeaderStyled = styled.header`
  height: 6.2rem;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 2rem;
  border: 0.1rem solid var(--color-border);
`

// Move to LOGO component =================
const Logo = styled.a`
  width: auto;
  height: 3rem;
  transform: perspective(20rem) rotateY(0);
  transform-style: preserve-3d;
  transition: transform 1s ease-in-out;

  &:hover {
    animation-name: spin;
    animation-duration: 4s;
    animation-iteration-count: infinite;
  }

  > img {
    background: url(${LogoImage}) no-repeat center/contain;
    border: 0;
    object-fit: contain;
    width: inherit;
    height: inherit;
  }

  @keyframes spin {
    0% {
      transform: perspective(20rem) rotateY(0);
    }
    30% {
      transform: perspective(20rem) rotateY(200deg);
    }
    100% {
      transform: perspective(20rem) rotateY(720deg);
    }
  }
`
// ========================================

// Move to separate NAV component =========
const NavStyled = styled.ol`
  list-style: none;
  display: flex;
  padding: 0 0 0 1.6rem;

  > li {
    font-size: 1.6rem;
    color: var(--color-text-secondary);
    background-color: transparent;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    border-radius: 0.6rem;
    position: relative;
  }

  > li.active,
  > li:hover {
    background-color: var(--color-button-primary);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  > li:not(:last-of-type) {
    margin: 0 0.7rem 0 0;
  }

  > li > a {
    font-weight: var(--font-weight-normal);
    font-size: inherit;
    color: inherit;
    text-align: center;
    text-decoration: none;
    padding: 1rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    position: relative;
  }
`
// =======================================

// Move to separte NavUserTools
const NavUserTools = styled(NavStyled)`
  margin: 0 0 0 auto;
  padding: 0;

  > li {
    display: flex;
    align-items: center;

    &:not(:last-of-type) {
      margin: 0 2.4rem 0 0;
    }

    &:not(:last-of-type)::after {
      content: '';
      display: block;
      width: 0.1rem;
      height: 2.4rem;
      background: var(--color-border);
      margin: 0 1.6rem;
      position: absolute;
      right: -2.8rem;
    }

    > a {
      transition: background 0.2s ease-in-out;
    }
  }
`

const PortfolioLink = styled.li`
  > a::before {
    display: block;
    margin: 0 0.5rem 0 0;
    width: 1.6rem;
    height: 1.4rem;
    content: '';
    background: url(${PortfolioImage}) no-repeat center/contain;
  }

  &:hover > a::before {
    background: url(${PortfolioImageWhite}) no-repeat center/contain;
  }
`

const SettingsLink = styled.li`
  > a {
    display: block;
    margin: 0;
    width: 3.6rem;
    height: 1.4rem;
    content: '';
    background: url(${SettingsImage}) no-repeat center/contain;
  }

  &:hover > a {
    background: url(${SettingsImageWhite}) no-repeat center/contain;
  }
`

const NotificationsLink = styled.li`
  > a {
    display: block;
    margin: 0;
    width: 3.6rem;
    height: 1.4rem;
    content: '';
    background: url(${NotificationsImage}) no-repeat center/contain;
  }

  &:hover > a {
    background: url(${NotificationsImageWhite}) no-repeat center/contain;
  }
`
// =======================================

export const Header: React.FC = () => (
  <HeaderStyled>
    <Logo href="#">
      <img src={LogoImage} />
    </Logo>
    <NavStyled>
      <li>
        <a href="#">Trade</a>
      </li>
      <li>
        <a href="#">Swap</a>
      </li>
      <li>
        <a href="#">Liquidity</a>
      </li>
    </NavStyled>
    <NavUserTools>
      <PortfolioLink>
        <a href="#">Portfolio</a>
      </PortfolioLink>
      <UserWallet />
      <SettingsLink>
        <a href="#" title="View Settings Menu"></a>
      </SettingsLink>
      <NotificationsLink>
        <a href="#" title="View Notifications"></a>
      </NotificationsLink>
    </NavUserTools>
  </HeaderStyled>
)
