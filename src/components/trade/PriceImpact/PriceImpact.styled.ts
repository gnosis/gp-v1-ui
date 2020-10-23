import styled from 'styled-components'
import { FormMessage } from 'components/common/FormMessage'

export const PriceImpactFormMessage = styled(FormMessage)`
  &&&&& {
    flex-flow: row nowrap;
    font-weight: bold;
    background: none;

    > span.icon {
      font-size: larger;
      margin: 0 0.7rem 0 0.5rem;
    }
  }
`

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
