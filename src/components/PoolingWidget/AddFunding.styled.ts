import styled from 'styled-components'
import { HighlightDiv } from './PoolingWidget.styled'

export const AddFundingWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;

  > p {
    margin: 0 0 2.4rem;
    font-size: inherit;
    line-height: inherit;
  }

  > ul {
    margin: 0 0 2.4rem;
  }

  ${HighlightDiv} {
    border-radius: var(--border-radius);
    padding: 1rem 1rem 0;
    box-sizing: border-box;
    margin: 1.6rem 0;

    > span {
      padding: 0 1rem;
      box-sizing: border-box;
      font-size: inherit;
      line-height: inherit;

      // Etherscan link
      a {
        word-break: break-all;
        display: block;
        font-size: inherit;
      }
    }
  }
`
