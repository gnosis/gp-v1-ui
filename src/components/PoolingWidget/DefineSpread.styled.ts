import styled from 'styled-components'
import { ProgressStepText } from './PoolingWidget.styled'
import { MEDIA } from 'const'

export const DefineSpreadWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 50%;
  width: calc(50% - 1.5rem);
  padding: 0;
  box-sizing: border-box;

  @media ${MEDIA.mobile} {
    width: 100%;
  }

  > strong {
    margin: 0 0 1rem 0;
    color: #2f3e4e;
  }

  > input {
    margin: 0 0 2.4rem 0;
    width: auto;
    max-width: 100%;
    background: #e7ecf3;
    border-radius: 0.6rem 0.6rem 0 0;
    border: 0;
    font-size: 1.6rem;
    line-height: 1;
    box-sizing: border-box;
    border-bottom: 0.2rem solid transparent;
    font-weight: var(--font-weight-normal);
    padding: 0 1rem;
    outline: none;
    font-family: inherit;
    height: 5.6rem;
    width: 100%;

    &:focus {
      border-bottom: 0.2rem solid #218dff;
      border-color: #218dff;
      color: #218dff;
    }

    &.error {
      border-color: #ff0000a3;
    }

    &.warning {
      border-color: orange;
    }

    &:disabled {
      box-shadow: none;
    }
  }
`

export const SpreadInformationWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
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

export const BlueBoldText = styled(ProgressStepText)`
  color: #218dff;
  font-weight: var(--font-weight-medium);
`
