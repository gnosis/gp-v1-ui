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
    transition: color .2s ease-in-out, background .2s ease-in-out;
    font-weight: var(--font-weight-medium);
    font-size: 2.3rem;
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
        color: rgba(78, 106, 133, .75);
      }
    
    &:hover {
      color: var(--color-text-active);
      background: var(--color-background-nav-active);
    }

    &.active {
      color: var(--color-text-active);
      background: var(--color-background-nav-active);
      @media ${MEDIA.mobile} {
        padding: 0 1.2rem;
        font-size: 1.6rem;
        height: 4.6rem;
        background: #208dff;
        color: #ffffff;
      }
    }
  }

  /* ${({ $responsive, $open }): string | false =>
    $responsive &&
    `
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
    background: var(--color-background-pageWrapper);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    height: ${$open ? 'auto' : '3.9375rem'};
    overflow: hidden;
    padding: 0;
  `} */
`

export const OrderedNavLinkDiv = styled.span<{ $order: number }>`
  order: ${({ $order }): number => $order};
  display: flex;
  align-items: center;

  &:not(:last-of-type) {
    margin: 0 1.6rem 0 0;
    @media ${MEDIA.mobile} {
      margin: 0;
    }
  }
`
