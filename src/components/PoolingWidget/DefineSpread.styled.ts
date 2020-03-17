import styled from 'styled-components'
import { ProgressStepText } from './PoolingWidget.styled'
import { InputBox } from 'components/TradeWidget/TokenRow'

export const DefineSpreadWrapper = styled(InputBox)`
  flex-flow: column nowrap;
  height: auto;

  > strong {
    margin: 0 0 1rem 0;
    color: #2f3e4e;
  }

  input {
    width: 100%;
    height: 5.6rem;
    padding: 0 1rem;

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
    color: #2f3e4e;
  }
  > p {
    margin: 0 0 2.4rem;
    font-size: inherit;
    line-height: inherit;
  }

  > p > i {
    font-style: normal;
    color: #218dff;
    font-weight: var(--font-weight-bold);
  }
`

export const BlueBoldText = styled(ProgressStepText)`
  color: #218dff;
  font-weight: var(--font-weight-bold);
`
