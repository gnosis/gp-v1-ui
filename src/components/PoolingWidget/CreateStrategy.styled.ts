import styled from 'styled-components'
import { MEDIA } from 'const'

export const CreateStrategyWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 50%;
  width: calc(50% - 1.5rem);
  padding: 0;
  box-sizing: border-box;
  background: var(--color-background);
  border-radius: 0.6rem;
  padding: 0 1.6rem;
  box-sizing: border-box;
  font-size: inherit;
  line-height: inherit;

  @media ${MEDIA.mobile} {
    width: 100%;
    margin: 0 0 1.6rem;
  }

  > strong {
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }
  > p {
    margin: 0 0 2.4rem;
    font-size: inherit;
    line-height: inherit;
  }

  > p > i {
    font-style: normal;
    color: var(--color-text-active);
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
