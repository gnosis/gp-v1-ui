import styled from 'styled-components'
import { HighlightDiv } from './PoolingWidget.styled'

export const AddFundingWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;

  > p {
    margin: 0 0 2.4rem;
    font-size: 1.5rem;
    line-height: 1.4;
  }

  > ul {
    margin: 0 0 2.4rem;
  }

  ${HighlightDiv} {
    border-radius: var(--border-radius);
    padding: 1rem 1rem 0;
    box-sizing: border-box;
    margin: 0 0 1.6rem;

    > span {
      padding: 0 1rem;
      box-sizing: border-box;
      font-size: 1.5rem;
      line-height: 1.4;

      // Etherscan link
      a {
        word-break: break-all;
        display: block;
        font-size: 1.3rem;
      }
    }
  }
`
