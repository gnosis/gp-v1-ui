import styled from 'styled-components'
import { UserWalletWrapper } from 'components/UserWallet/UserWallet.styled'

import { MEDIA } from 'const'

export const HeaderWrapper = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0 2.4rem;
  box-sizing: border-box;
  
    @media ${MEDIA.mobile} {
      padding: 1rem 1.6rem 0;
      box-sizing: border-box;
    }

  nav {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    width: 100%;
  }

  ${UserWalletWrapper} {
    margin: 2.4rem 0 3.2rem 3.2rem;
    order: 2;

    @media ${MEDIA.mobile} {
      margin: 0;
      order: 1;
    }
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
`
