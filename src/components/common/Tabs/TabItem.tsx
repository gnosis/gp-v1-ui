import React from 'react'
import styled from 'styled-components'

interface TabProps {
  title: string
  readonly id: number
  readonly isActive: boolean
  readonly activeColor?: string
  onTabClick: (arg: number) => void
}

interface WrapperProps {
  readonly activeColor?: string
}

const Wrapper = styled.li<WrapperProps>`
  background: var(--color-primary);
  color: var(--color-text-secondary2);
  height: var(--height-button-default);
  display: flex;
  align-items: center;
  flex: 1 1 0;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-large);
  letter-spacing: 0.1rem;
  text-align: center;
  justify-content: center;
  cursor: pointer;

  &:first-of-type {
    border-top-left-radius: var(--border-radius-default);
    border-bottom-left-radius: var(--border-radius-default);
  }

  &:last-of-type {
    border-top-right-radius: var(--border-radius-default);
    border-bottom-right-radius: var(--border-radius-default);
  }

  &.isActive {
    background: ${(props): string => (props.activeColor || 'var(--color-primary)')};
    color: var(--color-text-primary);
  }
`

const TabItem: React.FC<TabProps> = (props) => {
  const { onTabClick, id, title, isActive, activeColor } = props

  return (
    <Wrapper activeColor={activeColor} className={isActive ? 'isActive' : ''} onClick={(): void => onTabClick(id)}>
      {title}
    </Wrapper>
  )
}

export default TabItem
