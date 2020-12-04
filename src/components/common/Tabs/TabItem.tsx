import React from 'react'
import styled from 'styled-components'
import { TabThemeType } from 'components/common/Tabs/Tabs'

interface TabProps {
  title: string
  readonly id: number
  onTabClick: (arg: number) => void
  isActive: boolean
  readonly activeBgColor?: string
  readonly activeTextColor?: string
  readonly theme?: TabThemeType
}

interface WrapperProps {
  readonly activeBgColor?: string
  readonly activeTextColor?: string
  isActive: boolean
  readonly theme?: TabThemeType
}

const Wrapper = styled.button<WrapperProps>`
  background: ${({ isActive, theme }): string =>
    `var(${isActive && theme.activeBg ? theme.activeBg : theme.inactiveBg ? theme.inactiveBg : '--color-primary'})`};
  color: ${({ isActive, theme }): string =>
    `var(${
      isActive && theme.activeText
        ? theme.activeText
        : !isActive && theme.inactiveText
        ? theme.inactiveText
        : '--color-text-secondary2'
    })`};
  height: var(--height-button-default);
  display: flex;
  align-items: center;
  flex: 1 1 0;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-large);
  letter-spacing: 0.1rem;
  text-align: center;
  appearance: none;
  border: 0;
  justify-content: center;
  cursor: pointer;
  outline: 0;

  /* TODO: Provide alternative :focus styling because of using outline: 0; */

  &:first-of-type {
    border-top-left-radius: var(--border-radius-default);
    border-bottom-left-radius: var(--border-radius-default);
  }

  &:last-of-type {
    border-top-right-radius: var(--border-radius-default);
    border-bottom-right-radius: var(--border-radius-default);
    ${({ isActive, theme }): string | undefined =>
      isActive && theme.activeBgAlt ? `background: var(${theme.activeBgAlt})` : undefined}
  }
`

const TabItem: React.FC<TabProps> = (props) => {
  const { onTabClick, id, title, isActive, theme } = props

  return (
    <Wrapper role="tab" aria-selected={isActive} isActive={isActive} onClick={(): void => onTabClick(id)} theme={theme}>
      {title}
    </Wrapper>
  )
}

export default TabItem
