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

const SpreadInformation: React.FC<SpreadInformationProps> = ({ selectedTokensMap, spread }) => {
export const SpreadInformation: React.FC<SpreadInformationProps> = ({ selectedTokensMap, spread }) => {
  const tokenSymbolsString = React.useMemo(() => Array.from(selectedTokensMap.values()).map(token => token.symbol), [
    selectedTokensMap,
  ])

  return (
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
          <tr>
            <td className="responsive-cell">{tokenSymbolsString.join(' - ')}</td>
            <td data-label="Sell (at least)">
              <div className="responsive-cell">
                <RedBoldText as="span" $bold="normal">
                  ${(1 + spread / 100).toFixed(DEFAULT_DECIMALS)}
                </RedBoldText>
              </div>
              <div className="web-cell">
                {tokenSymbolsString.join(', ')} for <strong>at least</strong>{' '}
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
                {tokenSymbolsString.join(', ')} for <strong>at most</strong>{' '}
                <RedBoldText as="span" $bold="normal">
                  ${(1 - spread / 100).toFixed(DEFAULT_DECIMALS)}
                </RedBoldText>
              </div>
            </td>
          </tr>
        </tbody>
      </CardTable>
    </SpreadInformationWrapper>
  )
}

const DefineSpread: React.FC<DefineSpreadProps> = ({ selectedTokensMap, defaultSpread = 0.2 }) => {
  const [spread, setSpread] = useSafeState(defaultSpread)

  const handleSpreadChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    if (+value < 0 || +value >= 100) return

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
