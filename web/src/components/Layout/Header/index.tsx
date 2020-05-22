import React from 'react'
import styled from 'styled-components'

// utils, const
import { formatSeconds } from 'utils'
import { MEDIA } from 'const'

// Components
import UserWallet from 'components/UserWallet'

// Header: Subcomponents
import { NavigationLinks } from 'components/Layout/Header/Navigation'
import { HeaderWrapper } from 'components/Layout/Header/Header.styled'
import useNavigation from 'components/Layout/Header/useNavigation'
import useOpenCloseNav from 'components/Layout/Header/useOpenCloseNav'

// hooks
import { useTimeRemainingInBatch } from 'hooks/useTimeRemainingInBatch'

export interface HeaderProps {
  [key: string]: {
    label: string
    to: string
    order: number
    withPastLocation?: boolean
  }[]
}

const TopWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  margin: 0 auto;
  justify-content: center;
  align-items: center;

  @media ${MEDIA.mobile} {
    justify-content: space-between;
  }
`

const CountDownStyled = styled.div`
  display: flex;
  order: 2;
  font-family: var(--font-mono);
  font-size: 1.2rem;
  color: var(--color-text-primary);
  width: 16rem;
  letter-spacing: 0;

  @media ${MEDIA.mobile} {
    flex-flow: row wrap;
    line-height: 1.2;
    width: auto;
  }

  > strong {
    color: var(--color-text-active);
  }
`

const BatchCountDown: React.FC = () => {
  const timeRemainingInBatch = useTimeRemainingInBatch()
  return (
    <CountDownStyled>
      Next batch in: <strong>{formatSeconds(timeRemainingInBatch)}</strong>
    </CountDownStyled>
  )
}

const Header: React.FC<HeaderProps> = ({ navigation: initialState }: HeaderProps) => {
  const { isResponsive, openNav, setOpenNav } = useOpenCloseNav()
  const navigationArray = useNavigation(initialState, isResponsive)

  const handleOpenNav = (): void | false => isResponsive && setOpenNav(!openNav)

  return (
    <HeaderWrapper>
      <nav>
        {/* LOGO */}
        {/* <NavLink className="logo" to="/order">
          {APP_NAME}
        </NavLink> */}
        <TopWrapper>
          {/* USER WALLET */}
          <UserWallet />
          {/* Global Batch Countdown */}
          <BatchCountDown />
        </TopWrapper>
        {/* HEADER LINKS */}
        <NavigationLinks
          navigation={navigationArray}
          responsive={isResponsive}
          handleOpenNav={handleOpenNav}
          showNav={openNav}
        />
      </nav>
    </HeaderWrapper>
  )
}

export default Header
