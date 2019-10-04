import React from 'react'
import styled from 'styled-components'

import { Row } from './Row'
import { useTokenBalances } from 'hooks/useTokenBalances'
import ErrorMsg from 'components/ErrorMsg'
import { depositApi } from 'api'
import { EtherscanLink } from 'components/EtherscanLink'

const Wrapper = styled.section`
  font-size: 0.85rem;
  padding-bottom: 4em;
  // border-spacing: 0px;
  table {
    border-collapse: collapse;
  }

  tr {
    transition: all 0.5s ease;
  }

  td,
  th {
    text-align: center;
  }

  th {
    color: #000000;
    line-height: 1.5;
    font-size: 0.8em;
    text-transform: uppercase;
    overflow-wrap: break-word;
    padding: 0.5em;
    font-weight: 800;
  }

  tr td:last-child {
    width: 18em;
    text-align: center;
  }

  td {
    padding: 1em 0.5em;
  }

  tr {
    border-bottom: 1px solid #f2f2f2;
  }

  tr:last-child {
    border-bottom: none;
  }
`

const LinkWrapper = styled.div`
  a {
    text-align: right;
    margin-bottom: 3em;
    display: block;
  }
`

const DepositWidget: React.FC = () => {
  const { balances, error } = useTokenBalances()
  const contractAddress = depositApi.getContractAddress()

  if (balances === undefined) {
    // Loading: Do not show the widget
    return <></>
  }
  const contractLink = (
    <EtherscanLink type="contract" identifier={contractAddress} label={<small>View verified contract</small>} />
  )

  return (
    <Wrapper className="widget">
      {contractLink && <LinkWrapper>{contractLink}</LinkWrapper>}
      {error ? (
        <ErrorMsg title="oops..." message="Something happened while loading the balances" />
      ) : (
        <table>
          <thead>
            <tr>
              <th colSpan={2}>Token</th>
              <th>
                Exchange
                <br />
                wallet
              </th>
              <th>
                Pending
                <br />
                withdrawals
              </th>
              <th>Wallet</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {balances &&
              balances.map(tokenBalances => <Row key={tokenBalances.addressMainnet} tokenBalances={tokenBalances} />)}
          </tbody>
        </table>
      )}
    </Wrapper>
  )
}

export default DepositWidget
