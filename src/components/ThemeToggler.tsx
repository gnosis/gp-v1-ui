import React, { useEffect } from 'react'
import styled from 'styled-components'
import useSafeState from 'hooks/useSafeState'

const ToggleLabel = styled.label<{ selected: boolean }>`
  color: var(--color-text-primary);
  background-color: ${(props): string =>
    props.selected ? 'var(--color-background-highlighted);' : 'var(--color-background);'}
  border: 1px solid gray;
  text-transform: uppercase;

  > input {
    display: none;
  }
`

const TogglesStyled = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
`

const toggleValues = ['auto', 'light', 'dark']
const toggleValue2class = {
  light: 'light-theme',
  dark: 'dark-theme',
}
const themeClasses = Object.values(toggleValue2class)

const ThemeToggler: React.FC = () => {
  const [active, setActive] = useSafeState('auto')

  useEffect(() => {
    const className = toggleValue2class[active]

    document.body.classList.remove(...themeClasses)
    if (className) document.body.classList.add(className)
  }, [active])

  return (
    <TogglesStyled>
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
    </TogglesStyled>
  )
}

export default ThemeToggler
