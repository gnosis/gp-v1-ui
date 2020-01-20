import styled from 'styled-components'
import { RESPONSIVE_SIZES } from 'const'

export const CreateStrategyWrapper = styled.div`
  background: var(--color-background);
  padding: 1em 3em;
`

export const StrategyDetailsWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1em;
  justify-items: center;
  align-items: center;

  @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
    grid-template-columns: 1fr;

    .graph {
      display: none;
    }
  }
`
