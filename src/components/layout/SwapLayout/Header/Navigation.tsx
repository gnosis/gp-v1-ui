import React from 'react'
import { NavLink } from 'react-router-dom'

// Components
import LinkWithPastLocation from 'components/LinkWithPastLocation'

// Header: subcomponents
import { OrderedNavLinkDiv, NavLinksWrapper } from 'components/layout/SwapLayout/Header/Navigation.styled'

export interface HeaderNavLinksInterface {
  label: string
  order: number
  to: string | Location
  withPastLocation?: boolean
}

interface BaseNavigationProps {
  responsive: boolean
}

interface NavigationLinksProps extends BaseNavigationProps {
  navigation: HeaderNavLinksInterface[]
  showNav: boolean
  handleOpenNav: () => void
}

interface HeaderNavLinksProps extends HeaderNavLinksInterface, BaseNavigationProps {
  showLinkSelector: boolean
}

const HeaderNavLink: React.FC<HeaderNavLinksProps> = ({ to, withPastLocation = false, label }) => (
  <OrderedNavLinkDiv>
    {withPastLocation ? (
      <LinkWithPastLocation to={to}>{label}</LinkWithPastLocation>
    ) : (
      <NavLink to={to}>{label}</NavLink>
    )}
    {/* Only show chevron in responsive mode when label is top */}
    {/* {responsive && order === 0 && (
      <FontAwesomeIcon
        icon={showLinkSelector ? faChevronCircleUp : faChevronCircleDown}
        style={{ cursor: 'pointer', marginLeft: 10, width: '0.5em' }}
      />
    )} */}
  </OrderedNavLinkDiv>
)

export const NavigationLinks: React.FC<NavigationLinksProps> = ({ navigation, responsive, showNav, handleOpenNav }) => (
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
      />
    ))}
  </NavLinksWrapper>
)
