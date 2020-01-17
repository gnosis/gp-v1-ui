import React from 'react'
import { TokenDetails } from '@gnosis.pm/dex-js'
import useSafeState from 'hooks/useSafeState'
import { SpreadInformationWrapper, DefineSpreadWrapper, RedBoldText } from './DefineSpread.styled'
import { DEFAULT_DECIMALS } from 'const'
import { CardTable } from 'components/Layout/Card'

interface DefineSpreadProps {
  selectedTokensMap: Map<number, TokenDetails>
  defaultSpread?: number
}

interface SpreadInformationProps extends DefineSpreadProps {
  spread: number
}

const SpreadInformation: React.FC<SpreadInformationProps> = ({ selectedTokensMap, spread }) => (
  <SpreadInformationWrapper>
    <CardTable
      $columns="1fr 1fr"
      $cellSeparation="0 1rem"
      // TODO: change CardTable so that header row margins
      // is a props and doesn't need !important
      $webCSS={`
        thead > tr { margin: 0 !important; };
        tbody > tr { 
          min-height: 3.5rem;
        } 
      `}
      $responsiveCSS={`
        tbody > tr { 
          > td:first-child {
            font-weight: bolder;
            margin: auto;
            width: 90%;
            &::before {
              content: none;
            }
          } 
        }
      `}
    >
      <thead>
        <tr>
          <th>Sell Spread</th>
          <th>Buy Spread</th>
        </tr>
      </thead>
      <tbody>
        {Array.from(selectedTokensMap).map(([id, token], _, arr) =>
          arr.map(([otherId, otherToken]) => {
            if (otherId === id) return
            return (
              <tr key={`${token.address}-${otherToken.address}`} data-label={`${token.symbol}-${otherToken.symbol}`}>
                <td className="responsive-cell">
                  {token.symbol || token.name} - {otherToken.symbol || otherToken.name}
                </td>
                <td data-label="Sell (at least)">
                  <div className="responsive-cell">
                    <RedBoldText as="span" $bold="normal">
                      ${(1 + spread / 100).toFixed(DEFAULT_DECIMALS)}
                    </RedBoldText>
                  </div>
                  <div className="web-cell">
                    {token.symbol || token.name} and {otherToken.symbol || otherToken.name} for{' '}
                    <strong>at least</strong>{' '}
                    <RedBoldText as="span" $bold="normal">
                      ${(1 + spread / 100).toFixed(DEFAULT_DECIMALS)}
                    </RedBoldText>
                  </div>
                </td>
                <td data-label="Buy (at most)">
                  <div className="responsive-cell">
                    <RedBoldText as="span" $bold="normal">
                      ${(1 - spread / 100).toFixed(DEFAULT_DECIMALS)}
                    </RedBoldText>
                  </div>
                  <div className="web-cell">
                    {token.symbol || token.name} and {otherToken.symbol || otherToken.name} for <strong>at most</strong>{' '}
                    <RedBoldText as="span" $bold="normal">
                      ${(1 - spread / 100).toFixed(DEFAULT_DECIMALS)}
                    </RedBoldText>
                  </div>
                </td>
              </tr>
            )
          }),
        )}
      </tbody>
    </CardTable>
  </SpreadInformationWrapper>
)

const DefineSpread: React.FC<DefineSpreadProps> = ({ selectedTokensMap, defaultSpread = 0.2 }) => {
  const [spread, setSpread] = useSafeState(defaultSpread)

  const handleSpreadChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    if (+value < 0) return

    setSpread(+value)
  }

  return (
    <DefineSpreadWrapper>
      <input type="number" step="0.1" value={spread} onChange={handleSpreadChange} />
      <SpreadInformation selectedTokensMap={selectedTokensMap} spread={spread} />
    </DefineSpreadWrapper>
  )
}

export default DefineSpread
