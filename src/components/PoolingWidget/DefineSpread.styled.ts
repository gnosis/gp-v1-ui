import styled from 'styled-components'
import { ProgressStepText } from './PoolingWidget.styled'
import InputBox from 'components/InputBox'

export const DefineSpreadWrapper = styled(InputBox)`
  flex-flow: column nowrap;
  height: auto;

  > strong {
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  input {
    width: 100%;
    height: 5.6rem;
    padding: 0 1rem;
    background: var(--color-background-input-lighter);

    &.warning {
      border-color: orange;
    }
  }
`

export const SpreadInformationWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
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

export const BlueBoldText = styled(ProgressStepText)`
  color: var(--color-text-active);
  font-weight: var(--font-weight-bold);
`
