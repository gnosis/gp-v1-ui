import React from 'react'
import styled from 'styled-components'
import { TabThemeType } from 'components/common/Tabs/Tabs'

interface TabProps {
  title: string
  readonly id: number
  onTabClick: (arg: number) => void
  isActive: boolean
  readonly tabTheme: TabThemeType
  readonly count?: number
}

interface WrapperProps {
  isActive: boolean
  readonly tabTheme: TabThemeType
}

const Wrapper = styled.button<WrapperProps>`
  background: ${({ isActive, tabTheme }): string =>
    `var(${
      isActive && tabTheme.activeBg ? tabTheme.activeBg : tabTheme.inactiveBg ? tabTheme.inactiveBg : '--color-primary'
    })`};
  color: ${({ isActive, tabTheme }): string =>
    `var(${
      isActive && tabTheme.activeText
        ? tabTheme.activeText
        : !isActive && tabTheme.inactiveText
        ? tabTheme.inactiveText
        : '--color-text-secondary2'
    })`};
  height: var(--height-button-default);
  display: flex;
  align-items: center;
  flex: 1 1 0;
  font-weight: ${({ tabTheme }): string => `${tabTheme.fontWeight ? tabTheme.fontWeight : 'var(--font-weight-bold)'}`};
  font-size: ${({ tabTheme }): string =>
    `${tabTheme.fontSize ? `var(${tabTheme.fontSize})` : 'var(--font-size-large)'}`};
  letter-spacing: ${({ tabTheme }): string => `${tabTheme.letterSpacing ? tabTheme.letterSpacing : '0'}`};
  border: 0;
  border-bottom: ${({ isActive, tabTheme }): string =>
    `${
      isActive && tabTheme.activeBorder
        ? `.1rem solid var(${tabTheme.activeBorder})`
        : !isActive && tabTheme.inactiveBorder
        ? `.1rem solid var(${tabTheme.inactiveBorder})`
        : 'none'
    }`};
  text-align: center;
  appearance: none;
  justify-content: center;
  cursor: pointer;
  outline: 0;

  /* TODO: Provide alternative :focus styling because of using outline: 0; */

  &:first-of-type {
    border-top-left-radius: ${({ tabTheme }): string =>
      `${tabTheme.borderRadius === false ? '0' : 'var(--border-radius-default)'}`};
    border-bottom-left-radius: ${({ tabTheme }): string =>
      `${tabTheme.borderRadius === false ? '0' : 'var(--border-radius-default)'}`};
  }

  &:last-of-type {
    border-top-right-radius: ${({ tabTheme }): string =>
      `${tabTheme.borderRadius === false ? '0' : 'var(--border-radius-default)'}`};
    border-bottom-right-radius: ${({ tabTheme }): string =>
      `${tabTheme.borderRadius === false ? '0' : 'var(--border-radius-default)'}`};
    ${({ isActive, tabTheme }): string | undefined =>
      isActive && tabTheme.activeBgAlt ? `background: var(${tabTheme.activeBgAlt})` : undefined}
  }
`

const TabItem: React.FC<TabProps> = (props) => {
  const { onTabClick, id, title, isActive, tabTheme } = props

  return (
    <Wrapper
      role="tab"
      aria-selected={isActive}
      isActive={isActive}
      onClick={(): void => onTabClick(id)}
      tabTheme={tabTheme}
    >
      {title}
    </Wrapper>
  )
}

export default TabItem
