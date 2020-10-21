import styled from 'styled-components'
import { FormMessage } from 'components/common/FormMessage'

export const PriceImpactFormMessage = styled(FormMessage)`
  &&&&& {
    flex-flow: row nowrap;

    > span:first-child {
      font-size: larger;
      margin: 0 0.7rem 0 0.5rem;
    }
  }
`

export const BoldColourTag = styled.strong`
  &.highImpact {
    color: var(--color-button-danger);
  }

  &.lowImpact {
    color: var(--color-button-success);
  }

  > span {
    color: var(--color-text-primary);
    margin-right: 0.5rem;
  }
`
