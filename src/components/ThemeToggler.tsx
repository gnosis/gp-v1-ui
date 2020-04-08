import React, { useEffect } from 'react'
import styled from 'styled-components'
import useSafeState from 'hooks/useSafeState'
import { MEDIA } from 'const'

const FUSE_APP_THEME = 'FUSE_APP_THEME'

const TogglerWrapper = styled.div`
  font-size: inherit;
  margin: 0 6rem 0 0;
  @media ${MEDIA.mobile} {
    margin: 2.4rem 0;
  }
`
const ToggleLabel = styled.label<{ selected: boolean }>`
  color: ${(props): string => (props.selected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)')};
  cursor: pointer;
  font-weight: ${(props): string => (props.selected ? 'bolder' : 'normal')};

  padding: 0.125rem 0.5rem;
  text-transform: uppercase;

  transition: all 0.2s ease-in-out;

  &:nth-child(2) {
    border-left: 0.0625rem solid var(--color-text-primary);
    border-right: 0.0625rem solid var(--color-text-primary);
  }

  &:hover {
    color: var(--color-text-primary);
  }

  > input {
    display: none;
  }
`

const toggleValues = ['auto', 'light', 'dark']
const toggleValue2class = {
  light: 'light-theme',
  dark: 'dark-theme',
}
const themeClasses = Object.values(toggleValue2class)

const ThemeToggler: React.FC = () => {
  const startTheme = localStorage.getItem(FUSE_APP_THEME) || 'auto'
  const [active, setActive] = useSafeState(startTheme)

  useEffect(() => {
    const className = toggleValue2class[active]

    document.body.classList.remove(...themeClasses)
    if (className) {
      document.body.classList.add(className)
      localStorage.setItem(FUSE_APP_THEME, active)
    } else {
      localStorage.removeItem(FUSE_APP_THEME)
    }
  }, [active])

  return (
    <TogglerWrapper>
      Theme:{' '}
      {toggleValues.map(value => (
        <ToggleLabel key={value} selected={value === active}>
          <input
            type="radio"
            name="theme"
            value={value}
            checked={value === active}
            onChange={(): void => setActive(value)}
          />
          {value}
        </ToggleLabel>
      ))}
    </TogglerWrapper>
  )
}

export default ThemeToggler
