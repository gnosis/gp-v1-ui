import styled from 'styled-components'
import { MEDIA } from 'const'

export const NavLinksWrapper = styled.div<{ $open?: boolean; $responsive: boolean }>`
  display: flex;
  order: 1;
  flex: 1 1 100%;
  margin: auto;
  align-items: center;
  justify-content: center;

  @media ${MEDIA.mobile} {
    flex-flow: row wrap;
    background: #dde4ed;
    border-radius: 15rem;
    width: 100%;
    margin: 0 auto;
    justify-content: space-between;
  }

  a:link,
  a:visited {
    border: 0.125rem solid transparent;
    color: var(--color-text-secondary);
    font-weight: bolder;
    text-decoration: none;
    transition: color 0.2s ease-in-out, background 0.2s ease-in-out;
    font-weight: var(--font-weight-bold);
    font-size: 2.1rem;
    padding: 0 4rem;
    border-radius: 15rem;
    letter-spacing: 0;
    text-align: center;
    box-sizing: border-box;
    height: 5.4rem;
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    @media ${MEDIA.mobile} {
      color: rgba(78, 106, 133, 0.75);
      margin: 0;
      padding: 0;
      font-size: 1.3rem;
      width: 100%;
      height: 4rem;
    }

    &:hover {
      color: var(--color-text-active);
      background: var(--color-background-nav-active);
    }

    &.active {
      color: var(--color-text-active);
      background: var(--color-background-nav-active);
      @media ${MEDIA.mobile} {
        background: #208dff;
        color: var(--color-background-pageWrapper);
      }
    }
  }
`

export const OrderedNavLinkDiv = styled.span`
  display: flex;
  align-items: center;
  flex: 1 1 auto;

  // Hide 'ORDERS' tab on desktop/tablet (until we decide to show it for all devices...)
  &:nth-of-type(3) {
    display: none;
    @media ${MEDIA.mobile} {
      display: flex;
    }
  }

  @media ${MEDIA.mobile} {
    justify-content: center;
    flex: 1 1 25%;
  }

  &:not(:last-of-type) {
    margin: 0 1.6rem 0 0;
    @media ${MEDIA.mobile} {
      margin: 0;
    }
  }
`
