import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { useLocation, Switch, Route } from 'react-router'

import Wallet, { WalletWrapper } from 'components/Wallet'
import LinkWithPastLocation from 'components/LinkWithPastLocation'

const Wrapper = styled.header`
  padding: 1rem;

  nav {
    display: flex;
    flex-flow: row wrap;
    align-items: center;

    @media only screen and (max-width: 866px) {
      justify-content: center;
    }
  }

  .nav-links {
    display: flex;
    flex: 1;
    justify-content: center;

    padding: 0;
    list-style-type: none;
    white-space: nowrap;

    a {
      color: var(--color-text-secondary);
      font-size: 3.2rem;
      font-weight: 1000;
      padding: 0.8em;
      text-decoration: none;

      transition: color 0.2s ease-in-out;

      &:hover {
        color: var(--color-text-primary);
      }

      &.active {
        color: var(--color-text-primary);
      }
    }

    @media only screen and (max-width: 866px) {
      flex: 1 1 100%;
      order: 2;
    }
  }

  .logo,
  ${WalletWrapper} {
    flex: 0 1 16rem;
  }

  .logo {
    font-size: 2.8rem;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;

    &:hover {
      color: var(--color-text-secondary);
      cursor: pointer;
    }
    @media only screen and (max-width: 915px) {
      display: none;
    }
  }

  .nav-links,
  .logo {
    padding: 0.5rem;
    margin: 0.5rem;
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

  @media only screen and (max-width: 500px) {
    .logo,
    .nav-links,
    ${WalletWrapper} {
      padding: 0.25rem;
    }

    .nav-links {
      margin: 0 auto;
      flex-flow: column;
      align-items: center;
    }

    ${WalletWrapper} {
      font-size: 80%;
      order: 3;
      &::last-child {
        border-top: 0.7px solid #00000029 !important;
      }
    }
  }

  @media only screen and (max-width: 866px) {
    padding-bottom: 1rem;
  }
`

const Header: React.FC = () => {
  const location = useLocation()

  const { from } = location.state || { from: { pathname: '/trade' } }

  return (
    <Wrapper>
      <nav>
        <NavLink className="logo" to="/trade">
          fuse
        </NavLink>
        <ul className="nav-links">
          <li>
            <NavLink to={from}>Trade</NavLink>
          </li>
          {/* 
            TODO: Placeholder for strategies
          <li>
            <NavLink to="/strategies">Strategies</NavLink>
          </li>
          */}
          <li>
            <LinkWithPastLocation to="/wallet">Wallet</LinkWithPastLocation>
          </li>
          <li>
            <LinkWithPastLocation to="/orders">Orders</LinkWithPastLocation>
          </li>
        </ul>
        <Wallet />
      </nav>
      <div className="header-title">
        <Switch>
          <Route path="/trade" />
          <Route path="/strategies" />
          <Route path="/wallet" />
          <Route path="/orders" />
          <Route path="/connect-wallet" />
        </Switch>
      </div>
    </Wrapper>
  )
}

export default Header
