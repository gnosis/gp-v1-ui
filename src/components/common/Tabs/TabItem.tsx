import React from 'react'
import styled from 'styled-components'
import { TabThemeType } from 'components/common/Tabs/Tabs'

interface TabProps {
  title: string
  readonly id: number
  onTabClick: (arg: number) => void
  isActive: boolean
  readonly theme?: TabThemeType
  readonly count?: number
}

interface WrapperProps {
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
  font-weight: ${({ theme }): string => `${theme.fontWeight ? theme.fontWeight : 'var(--font-weight-bold)'}`};
  font-size: ${({ theme }): string => `${theme.fontSize ? `var(${theme.fontSize})` : 'var(--font-size-large)'}`};
  letter-spacing: ${({ theme }): string => `${theme.letterSpacing ? theme.letterSpacing : '0'}`};
  border: 0;
  border-bottom: ${({ isActive, theme }): string =>
    `${
      isActive && theme.activeBorder
        ? `.1rem solid var(${theme.activeBorder})`
        : !isActive && theme.inactiveBorder
        ? `.1rem solid var(${theme.inactiveBorder})`
        : 'none'
    }`};
  text-align: center;
  appearance: none;
  justify-content: center;
  cursor: pointer;
  outline: 0;

  /* TODO: Provide alternative :focus styling because of using outline: 0; */

  &:first-of-type {
    border-top-left-radius: ${({ theme }): string =>
      `${theme.borderRadius === false ? '0' : 'var(--border-radius-default)'}`};
    border-bottom-left-radius: ${({ theme }): string =>
      `${theme.borderRadius === false ? '0' : 'var(--border-radius-default)'}`};
  }

  &:last-of-type {
    border-top-right-radius: ${({ theme }): string =>
      `${theme.borderRadius === false ? '0' : 'var(--border-radius-default)'}`};
    border-bottom-right-radius: ${({ theme }): string =>
      `${theme.borderRadius === false ? '0' : 'var(--border-radius-default)'}`};
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
