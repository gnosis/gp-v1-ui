import styled from 'styled-components'
import { ProgressStepText } from './PoolingWidget.styled'
import { RESPONSIVE_SIZES } from 'const'

export const DefineSpreadWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  > * {
    margin: 0.5rem auto;
    width: auto;
  }
  > input {
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
}


  }
  > div {
    padding: 1rem;
  }
`

export const SpreadInformationWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-evenly;
  align-items: center;

  background: var(--color-background);
  border-radius: var(--border-radius);

  width: 82%;

  .responsive-cell {
    display: none;
  }

  @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
    width: 95%;

    .web-cell {
      display: none;
    }

    .responsive-cell {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: center;
    }
  }
`

export const RedBoldText = styled(ProgressStepText)`
  color: red;
`
