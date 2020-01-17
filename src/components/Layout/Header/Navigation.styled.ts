import styled from 'styled-components'
import { RESPONSIVE_SIZES } from 'const'

export const NavLinksWrapper = styled.div<{ $open?: boolean; $responsive: boolean }>`
  display: flex;
  justify-content: space-evenly;

  margin: 0.5rem;
  padding: 0.5rem;

  white-space: nowrap;

  a {
    border: 0.125rem solid transparent;
    color: var(--color-text-secondary);
    font-weight: bolder;
    padding: 0.35em;
    text-decoration: none;

    transition: color 0.2s ease-in-out;

    &:hover {
      color: var(--color-text-primary);
    }

    &.active {
      color: var(--color-text-primary);

      @media only screen and (min-width: ${RESPONSIVE_SIZES.TABLET}em) {
        border-bottom: 0.125rem solid var(--color-text-primary);
      }
    }
  }

  ${({ $responsive, $open }): string | false =>
    $responsive &&
    `
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
    
    background: var(--color-background-pageWrapper);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    height: ${$open ? 'auto' : '3.9375rem'}
    overflow: hidden;
    padding: 0;
  `}
`

export const OrderedNavLinkDiv = styled.h3<{ $order: number }>`
  order: ${({ $order }): number => $order};
  display: flex;
  align-items: center;
`
