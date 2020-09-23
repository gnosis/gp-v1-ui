import React from 'react'

// utils, const
import { formatSeconds, dateToBatchId } from 'utils'

// Components
import UserWallet from 'components/UserWallet'

// Header: Subcomponents
import { NavigationLinks } from 'components/layout/SwapLayout/Header/Navigation'
import {
  HeaderWrapper,
  BatchNumberWrapper,
  CountDownStyled,
  TopWrapper,
} from 'components/layout/SwapLayout/Header/Header.styled'

// hooks
import useNavigation from 'components/layout/SwapLayout/Header/useNavigation'
import useOpenCloseNav from 'components/layout/SwapLayout/Header/useOpenCloseNav'
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
