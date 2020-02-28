import styled from 'styled-components'
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
      padding: 0 1.2rem;
      box-sizing: border-box;
    }
  }

  ${UserWalletWrapper} {
    order: 1;
    margin: 3.2rem 3rem 3.2rem 0;

    @media ${MEDIA.mobile} {
      margin: 2rem 1rem 2rem 0;
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
