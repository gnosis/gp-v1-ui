import React from 'react'
import styled from 'styled-components'

// utils, const
import { formatSeconds, dateToBatchId } from 'utils'
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
import { HelpTooltipContainer, HelpTooltip } from 'components/Tooltip'

export interface HeaderProps {
  [key: string]: {
    label: string
    to: string
    order: number
    withPastLocation?: boolean
  }[]
}

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
  flex-flow: column;
  order 2;
  min-width: 15rem;

  > ${BatchNumberWrapper} {
    margin: 0.5rem 0;
    align-items: baseline;
    min-width: 16rem;
  }
`

export const DevdocTooltip = (
  <HelpTooltipContainer>
    <p>
      On Gnosis Protocol, orders placed on-chain are not immediately executed, but rather collected and aggregated to be
      settled in batches. These batch order settlements occur every 5 minutes consecutively.
    </p>
    <p>
      Learn more{' '}
      <a href="https://docs.gnosis.io/protocol/docs/intro-batches" target="_blank" rel="noopener noreferrer">
        here
      </a>
      .
    </p>
  </HelpTooltipContainer>
)

export const BatchNumberWithHelp: React.FC<{ batchId?: number | null; title?: string }> = ({
  batchId,
  title = 'Batch: ',
}) => (
  <BatchNumberWrapper className="BatchNumberWrapper">
    {title}
    <strong>{batchId || dateToBatchId()}</strong>
    &nbsp;
    <HelpTooltip tooltip={DevdocTooltip} />
  </BatchNumberWrapper>
)

const BatchCountDown: React.FC = () => {
  const timeRemainingInBatch = useTimeRemainingInBatch()
  return (
    <CountDownStyled>
      <BatchNumberWrapper>
        Next batch: <strong>{formatSeconds(timeRemainingInBatch)}</strong>
      </BatchNumberWrapper>
      <BatchNumberWithHelp />
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
          {CONFIG.name}
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
