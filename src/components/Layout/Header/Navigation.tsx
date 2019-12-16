import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronCircleUp, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons'

import LinkWithPastLocation from 'components/LinkWithPastLocation'

export type NavLinkKeys = 'Trade' | 'Wallet' | 'Orders'

export const NavLinksWrapper = styled.div<{ $open?: boolean; $responsive: boolean }>`
  display: flex;
  justify-content: space-evenly;

  margin: 0.5rem;
  padding: 0.5rem;

  white-space: nowrap;

  a {
    color: var(--color-text-secondary);
    font-size: 3.2rem;
    font-weight: 1000;
    padding: 0.35em;
    text-decoration: none;

    transition: color 0.2s ease-in-out;

    &:hover {
      color: var(--color-text-primary);
    }

    &.active {
      color: var(--color-text-primary);
    }
  }

  ${({ $responsive, $open }): string | false =>
    $responsive &&
    `
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
    
    background: #fff;
    border-radius: 10px;
    cursor: pointer;
    height: ${$open ? 'auto' : '95px'}
    overflow: hidden;
  `}
`

const OrderedNavLinkDiv = styled.div<{ $order: number }>`
  order: ${({ $order }): number => $order};
`

export interface HeaderNavLinksInterface {
  label: string
  withPastLocation?: boolean
  to: string | Location
  order: number
}

const HeaderNavLink: React.FC<HeaderNavLinksInterface & {
  responsive: boolean
  showLinkSelector?: boolean
  handleLinkSelect: (key: NavLinkKeys) => void
}> = ({
  to,
  withPastLocation = false,
  label,
  order,
  handleLinkSelect,
  responsive,
  showLinkSelector,
}: HeaderNavLinksInterface & { responsive: boolean; showLinkSelector?: boolean; handleLinkSelect: Function }) => (
  <OrderedNavLinkDiv $order={order} onClick={(): void => handleLinkSelect(label)}>
    {withPastLocation ? (
      <LinkWithPastLocation to={to}>{label}</LinkWithPastLocation>
    ) : (
      <NavLink to={to}>{label}</NavLink>
    )}
    {/* Only show chevron in responsive mode when label is top */}
    {responsive && order === 0 && (
      <FontAwesomeIcon
        icon={showLinkSelector ? faChevronCircleUp : faChevronCircleDown}
        style={{ cursor: 'pointer', marginLeft: 10, verticalAlign: 'super' }}
      />
    )}
  </OrderedNavLinkDiv>
)

interface NavigationLinksProps {
  navigation: HeaderNavLinksInterface[]
  responsive: boolean
  showNav: boolean
  handleLinkSelect: (key: NavLinkKeys) => void
  handleOpenNav: () => void
}

export const NavigationLinks: React.FC<NavigationLinksProps> = ({
  navigation,
  responsive,
  showNav,
  handleLinkSelect,
  handleOpenNav,
}: NavigationLinksProps) => (
  <NavLinksWrapper $responsive={responsive} $open={showNav} onClick={handleOpenNav}>
    {navigation.map(({ label, to, order, withPastLocation }, index) => (
      <HeaderNavLink
        key={index}
        // Route props
        to={to}
        label={label}
        // Use state maintaining
        withPastLocation={withPastLocation}
        // Mobile link stack order
        order={responsive ? order : index + 1}
        responsive={responsive}
        showLinkSelector={showNav}
        handleLinkSelect={handleLinkSelect}
      />
    ))}
  </NavLinksWrapper>
)
