import styled from 'styled-components'

export const BoldColourTag = styled.strong`
  &.highImpact {
    color: var(--color-button-danger);
  }

  &.midImpact {
    color: var(--color-button-warning, lightorange);
  }

  &.lowImpact {
    color: var(--color-button-success);
  }

  > span {
    color: var(--color-text-primary);
    margin-right: 0.5rem;
  }
`
