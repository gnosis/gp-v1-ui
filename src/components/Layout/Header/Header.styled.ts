import styled from 'styled-components'
import { NavLinksWrapper } from './Navigation.styled'
import { UserWalletWrapper } from 'components/UserWallet/UserWallet.styled'

export const HeaderWrapper = styled.header`
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
  ${UserWalletWrapper} {
    flex: 0 1 16rem;
  }

  .logo {
    // TODO: remove when we have logo
    visibility: hidden;
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

  ${UserWalletWrapper} {
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
    ${UserWalletWrapper} {
      margin: 1rem auto;
    }
  }

  @media only screen and (max-width: 720px) {
    .logo,
    .nav-links,
    ${UserWalletWrapper} {
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
