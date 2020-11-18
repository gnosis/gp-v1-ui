import React from 'react'
import styled from 'styled-components'

interface TabProps {
  title: string
  onTabClick: () => void
  readonly activeColor: string | false
}

const Wrapper = styled.li<Pick<TabProps, 'activeColor'>>`
  background: ${({ activeColor }): string => `var(${activeColor || '--color-primary'})`};
  color: ${({ activeColor }): string => `var(--color-text-${activeColor ? 'primary' : 'secondary2'})`};
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
`

const TabItem: React.FC<TabProps> = ({ onTabClick, title, activeColor }) => (
  <Wrapper activeColor={activeColor} onClick={onTabClick}>
    {title}
  </Wrapper>
)

export default TabItem
