import React from 'react'
import styled from 'styled-components'

import { MEDIA } from 'const'
import { NavStyled } from '../Menu'
import { Frame } from 'components/common/Frame'

// import PortfolioImage from 'assets/img/portfolio.svg'
// import PortfolioImageWhite from 'assets/img/portfolio-white.svg'
import SettingsImage from 'assets/img/settings.svg'
import SettingsImageWhite from 'assets/img/settings-white.svg'
import NotificationsImage from 'assets/img/bell.svg'
import NotificationsImageWhite from 'assets/img/bell-white.svg'

const SettingsLink = styled.li`
  margin: 0 2.4rem 0 0;
  order: 3;

  > a {
    display: block;
    margin: 0;
    width: 3.6rem;
    height: 1.4rem;
    content: '';
    background: url(${SettingsImage}) no-repeat center/contain;
  }

  &:hover > a {
    background: url(${SettingsImageWhite}) no-repeat center/contain;
  }
`

const NotificationsLink = styled.li`
  order: 4;

  > a {
    display: block;
    margin: 0;
    width: 3.6rem;
    height: 1.4rem;
    content: '';
    background: url(${NotificationsImage}) no-repeat center/contain;
  }

  &:hover > a {
    background: url(${NotificationsImageWhite}) no-repeat center/contain;
  }
`

const Wrapper = styled(NavStyled)`
  margin: 0 0 0 auto;
  padding: 0;

  @media ${MEDIA.mediumDown} {
    flex-direction: row;
    justify-content: flex-start;
    justify-self: center;
    padding: 1rem;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 99;
    height: 7.2rem;
    border-radius: 0;
    background-color: var(--color-gradient-2);
  }

  > li {
    display: flex;
    align-items: center;

    &:not(:last-of-type)::after {
      content: '';
      display: block;
      width: 0.1rem;
      height: 2.4rem;
      background: var(--color-border);
      margin: 0 1.6rem;
      position: absolute;
      right: -2.8rem;
    }

    @media ${MEDIA.mediumDown} {
      &:first-of-type::after {
        content: none;
      }
    }

    > a {
      transition: background 0.2s ease-in-out;
    }
  }
`

const UserWallet: React.FC = () => <Frame>User Wallet</Frame>

type Props = React.PropsWithChildren<{
  hasWallet?: boolean
  hasSettings?: boolean
  hasNotifications?: boolean
}>

export const NavTools: React.FC<Props> = ({ children, hasWallet, hasSettings, hasNotifications }) => (
  <Wrapper>
    {children}
    {hasWallet && <UserWallet />}
    {hasSettings && (
      <SettingsLink>
        <a href="#" title="View Settings Menu"></a>
      </SettingsLink>
    )}
    {hasNotifications && (
      <NotificationsLink>
        <a href="#" title="View Notifications"></a>
      </NotificationsLink>
    )}
  </Wrapper>
)
