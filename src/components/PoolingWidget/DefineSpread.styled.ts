import styled from 'styled-components'

export const DefineSpreadWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  > * {
    margin: 0.5rem auto;
    width: auto;
  }
  > input {
    border: 0.125rem solid #000;
    margin: auto;
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

  background: var(--color-background-selected-dark);

  width: 50%;
`
