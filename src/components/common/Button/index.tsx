import styled from 'styled-components'
import StyledButton from 'styles/common/StyledButton'

export const ButtonBase = styled(StyledButton)`
  border-radius: 2rem;
  cursor: pointer;
  font-weight: bold;
  outline: 0;
  padding: 0.5rem 1rem;

  transition: all 0.2s ease-in-out;
  transition-property: color, background-color, border-color, opacity;

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
