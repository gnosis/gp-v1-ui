import React from 'react'
import styled from 'styled-components'
import { TokenDetails } from '@gnosis.pm/dex-js'

const DefineSpreadWrapper = styled.div`
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

const SpreadInformationWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-evenly;
  align-items: center;

  background: var(--color-background-selected-dark);

  width: 50%;
`

interface SpreadInformationProps {
  selectedTokens: TokenDetails[]
}

const SpreadInformation: React.FC<SpreadInformationProps> = ({ selectedTokens }) => {
  return (
    <SpreadInformationWrapper>
      {selectedTokens.map((token, index: number) => (
        <div key={index}>Sell {token.symbol || token.name} for at least $1.00</div>
      ))}
    </SpreadInformationWrapper>
  )
}

const DefineSpread: React.FC<SpreadInformationProps> = ({ selectedTokens }) => {
  return (
    <DefineSpreadWrapper>
      <input type="number" placeholder="0.5%" />
      <SpreadInformation selectedTokens={selectedTokens} />
    </DefineSpreadWrapper>
  )
}

export default DefineSpread
