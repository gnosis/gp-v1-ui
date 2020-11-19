import React from 'react'

import styled from 'styled-components'
import StyledButton, { ButtonVariations } from 'styles/common/StyledButton'

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<Element> {
  kind?: keyof typeof ButtonVariations
}

export const ButtonBase = styled(StyledButton)<ButtonBaseProps>`
  border-radius: 2rem;
  cursor: pointer;
  font-weight: bold;
  outline: 0;
  padding: 0.5rem 1rem;

  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
  transition-property: color, background-color, border-color, opacity, margin;

  &:disabled,
  &[disabled] {
    &:hover {
      background-color: var(--color-background-button-disabled-hover);
    }
    opacity: 0.35;
    pointer-events: none;
  }

  &.big {
    font-size: 1.2rem;
    padding: 0.65rem 1rem;
  }

  &.small {
    font-size: 0.6rem;
    padding: 0.3rem 0.5rem;
  }
`

const ThemeButtonToggleWrapper = styled.div<{ $mode: boolean }>`
  display: inline-flex;
  width: 5rem;
  background-color: gainsboro;
  border-radius: 2rem;

  > button {
    width: 75%;
    margin-left: ${({ $mode }): string | false => ($mode ? 'auto' : '0')};
  }
`

export const ThemeButton: React.FC<
  ButtonBaseProps & {
    mode: boolean
  }
> = (props) => {
  return (
    <ThemeButtonToggleWrapper $mode={props.mode}>
      <ButtonBase {...props} />
    </ThemeButtonToggleWrapper>
  )
}
