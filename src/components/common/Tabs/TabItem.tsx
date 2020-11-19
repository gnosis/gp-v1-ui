import React from 'react'
import styled from 'styled-components'

interface TabProps {
  title: string
  readonly id: number
  onTabClick: (arg: number) => void
  isActive: boolean
  readonly activeColor?: string
}

interface WrapperProps {
  readonly activeColor?: string
  isActive: boolean
}

const Wrapper = styled.button<WrapperProps>`
  background: ${({ isActive, activeColor }): string => `var(${isActive ? activeColor : '--color-primary'})`};
  color: ${({ isActive }): string => `var(--color-${isActive ? 'primary' : 'secondary2'})`};
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
  }
`

const TabItem: React.FC<TabProps> = (props) => {
  const { onTabClick, id, title, isActive, activeColor } = props

  return (
    <Wrapper
      role="tab"
      activeColor={activeColor}
      aria-selected={isActive}
      isActive={isActive}
      onClick={(): void => onTabClick(id)}
    >
      {title}
    </Wrapper>
  )
}

export default TabItem
