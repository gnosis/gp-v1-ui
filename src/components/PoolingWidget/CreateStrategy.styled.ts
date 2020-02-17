import styled from 'styled-components'

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
    font-weight: var(--font-weight-medium);
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
