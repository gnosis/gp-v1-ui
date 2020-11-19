import React from 'react'

import styled from 'styled-components'
import StyledButton, { ButtonVariations, ButtonSizeVariations } from 'styles/common/StyledButton'
import styles from 'styles/styles'

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<Element> {
  kind?: keyof typeof ButtonVariations
  size?: ButtonSizeVariations
}

export const ButtonBase = styled(StyledButton)<ButtonBaseProps>`
  border-radius: ${styles.borderRadius};
  cursor: pointer;
  font-weight: bold;
  outline: 0;
  padding: 0.5rem 1rem;

  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
  transition-property: color, background, border-color, opacity, margin;

  &:disabled,
  &[disabled] {
    pointer-events: none;
  }
`

const ThemeButtonToggleWrapper = styled.div<{ $mode: boolean }>`
  display: inline-flex;
  width: 5rem;
  background-color: gainsboro;
  border-radius: 2rem;

  > button {
    width: 75%;
    margin-left: ${({ $mode }): string => ($mode ? 'auto' : '0')};
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
