import styled from 'styled-components'
import { MEDIA } from 'const'

export const CreateStrategyWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 50%;
  width: calc(50% - 1.5rem);
  padding: 0;
  box-sizing: border-box;
  background: rgba(223, 230, 239, 0.51);
  border-radius: 0.6rem;
  padding: 1.6rem 1.6rem 0;
  box-sizing: border-box;

  @media ${MEDIA.mobile} {
    width: 100%;
    margin: 0 0 1.6rem;
  }

  > strong {
    margin: 0 0 1rem 0;
    color: #2f3e4e;
  }
  > p {
    margin: 0 0 2.4rem;
    font-size: 1.5rem;
    line-height: 1.4;
  }

  > p > i {
    font-style: normal;
    color: #218dff;
    font-weight: var(--font-weight-bold);
  }
`

export const StrategyDetailsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 50%;
  width: calc(50% - 1.5rem);
  padding: 0;
  box-sizing: border-box;
`

export const UnderlinedText = styled.span`
  text-decoration: underline;
`
