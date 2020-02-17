import styled from 'styled-components'
import { NavLinksWrapper } from './Navigation.styled'
import { UserWalletWrapper } from 'components/UserWallet/UserWallet.styled'

import { MEDIA } from 'const'

export const HeaderWrapper = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;

  nav {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    width: 100%;
    
      @media ${MEDIA.mobile} {
        padding: 0 1.6rem;
        box-sizing: border-box;
      }
  }
  
  ${UserWalletWrapper} {
    order: 1;
    margin: 2rem 0;
  }

  /* .logo, ${UserWalletWrapper} {
    flex: 0 1 16rem;
  } */

  /* .logo {
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
  } */

  /* ${NavLinksWrapper} {
  } */

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
`
