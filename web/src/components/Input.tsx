import styled from 'styled-components'

export const Input = styled.input<{ $error?: boolean }>`
  ${({ $error }): string | undefined | false =>
    $error &&
    `
    box-shadow: 0px 0px 0px 2px var(--color-error);
    color: var(--color-error) !important;
  `}

  transition: all 0.15s ease-in-out;
  &:focus {
    ${({ $error }): string | undefined | false => $error && 'border-color: var(--color-error) !important;'}
    box-shadow: none;
    color: initial;
  }
`
