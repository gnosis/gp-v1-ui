import styled from 'styled-components'
import { HighlightDiv } from './PoolingWidget.styled'

export const AddFundingWrapper = styled.div`
  display: grid;
  grid-template-rows: repeat(auto-fit, minmax(2rem, 1fr));
  grid-gap: 0.2rem 0rem;

  > *:not(:nth-child(2)) {
    padding: 0 0.8rem;
  }

  ${HighlightDiv} {
    border-radius: var(--border-radius);
    padding: 0.8rem;
    > span {
      margin: 0 0.5rem;
      // Etherscan link
      a {
        word-break: break-all;
      }
    }
  }
`
