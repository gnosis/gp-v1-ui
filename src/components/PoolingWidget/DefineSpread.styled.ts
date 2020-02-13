import styled from 'styled-components'
import { ProgressStepText } from './PoolingWidget.styled'
import { RESPONSIVE_SIZES } from 'const'

export const DefineSpreadWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 50%;
  width: calc(50% - 1.5rem);
  padding: 0;
  box-sizing: border-box;
  
  > input {
    margin: 0 0 2.4rem 0;
    width: auto;
    max-width: 100%;
    background: #E7ECF3;
    border-radius: .6rem .6rem 0 0;
    border: 0;
    font-size: 1.6rem;
    line-height: 1;
    box-sizing: border-box;
    border-bottom: .2rem solid transparent;
    font-weight: var(--font-weight-normal);
    padding: 0 1rem;
    outline: none;
    font-family: inherit;
    height: 5.6rem;
    width: 100%;
    
    &:focus {
      border-bottom: .2rem solid #218DFF;
      border-color: #218DFF;
      color: #218DFF;
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

  /* > input {
    
    background: var(--color-background-highlighted);
    border: 0.14rem solid var(--color-button-primary);
    font-size: larger;
    margin: auto;
    width: 20%;
    min-width: 5rem;
    text-align: center;

    &:focus {
      background: #bbfdbb87;
    }
} */


  }
  > div {
    /* padding: 1rem; */
  }
`

export const SpreadInformationWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  
`

export const RedBoldText = styled(ProgressStepText)`
  color: red;
`
