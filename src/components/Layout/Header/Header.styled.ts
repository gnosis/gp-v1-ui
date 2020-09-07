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
    width: auto;

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

export const BatchNumberWrapper = styled.span`
  &&&&& {
    display: inline-flex;
    font-family: var(--font-mono);
    font-size: 1.2rem;
    color: var(--color-text-primary);
    letter-spacing: 0;

    @media ${MEDIA.mobile} {
      flex-flow: row wrap;
      line-height: 1.2;
      width: auto;
    }

    > strong {
      color: var(--color-text-active);
    }
  }
`

export const TopWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  justify-content: center;
  align-items: center;

  @media ${MEDIA.mobile} {
    justify-content: space-between;
  }
`

export const CountDownStyled = styled.div`
  display: flex;
  flex-flow: column;
  order 2;
  min-width: 15rem;

  > ${BatchNumberWrapper} {
    min-width: 16rem;
    display: flex;
    font-family: var(--font-mono);
    font-size: 1.2rem;
    color: var(--color-text-primary);
    min-width: 16rem;
    letter-spacing: 0;
    margin: 0.5rem 0;
    align-items: baseline;

    @media ${MEDIA.mobile} {
      flex-flow: row wrap;
      line-height: 1.2;
      width: auto;
    }

    > strong {
      color: var(--color-text-active);
      margin-left: 0.3rem;
    }
  }
`
