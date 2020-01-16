import React from 'react'
import { TokenDetails } from '@gnosis.pm/dex-js'
import useSafeState from 'hooks/useSafeState'
import { SpreadInformationWrapper, DefineSpreadWrapper } from './DefineSpread.styled'
import { DEFAULT_DECIMALS } from 'const'

interface SpreadInformationProps {
  selectedTokens: TokenDetails[]
  spread: number
}

const SpreadInformation: React.FC<SpreadInformationProps> = ({ selectedTokens, spread }) => (
  <SpreadInformationWrapper>
    {/* [{ name: 'DAI', ... }, ...] */}
    <table>
      <thead>
        <tr>
          <th>Sell</th>
          <th>Buy</th>
        </tr>
      </thead>
      <tbody>
        {selectedTokens.map((token, index: number, arr) =>
          arr.map(otherToken => {
            if (otherToken.id === token.id) return
            return (
              <tr key={index}>
                <td>
                  Sell {token.symbol || token.name} and {otherToken.symbol || otherToken.name} for{' '}
                  <strong>at least</strong> ${(1 + spread / 100).toFixed(DEFAULT_DECIMALS)}
                </td>
                <td>
                  Buy {token.symbol || token.name} and {otherToken.symbol || otherToken.name} for{' '}
                  <strong>at most</strong> ${(1 - spread / 100).toFixed(DEFAULT_DECIMALS)}
                </td>
              </tr>
            )
          }),
        )}
      </tbody>
    </table>
  </SpreadInformationWrapper>
)

const DefineSpread: React.FC<SpreadInformationProps> = ({ selectedTokens }) => {
  const [spread, setSpread] = useSafeState(0.2)

  const handleSpreadChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    if (+value < 0) return

    setSpread(+value)
  }

  return (
    <DefineSpreadWrapper>
      <input type="number" step="0.1" value={spread} onChange={handleSpreadChange} />
      <SpreadInformation selectedTokens={selectedTokens} spread={spread} />
    </DefineSpreadWrapper>
  )
}

export default DefineSpread
