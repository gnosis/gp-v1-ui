import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Modali, { useModali } from 'modali'

import { Row } from './Row'
import { useTokenBalances } from 'hooks/useTokenBalances'
import ErrorMsg from 'components/ErrorMsg'
import BN from 'bn.js'
import { formatAmount, getToken } from 'utils'
import Widget from 'components/layout/Widget'
import { useRowActions } from './useRowActions'
import { log } from 'util'

const Wrapper = styled.section`
  table {
    width: 100%;
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
    max-width: 8rem;
    text-align: center;
    > button {
      font-size: 0.75rem;
      min-width: 6rem;
    }
  }

  td {
    padding: 1em 0.5em;
  }

  tr {
    border-bottom: 1px solid #00000026;

    @media (max-width: 768px) {
      border-bottom: 2px solid #00000026;
    }
  }

  tr:last-child {
    border-bottom: none;
  }
`

const ModalBodyWrapper = styled.div`
  div > p {
    padding: 0 1em;
    color: #828282;
    font-size: 0.85em;
  }
`

interface ModalBodyProps {
  pendingAmount: string
  symbol: string
}

const ModalBody: React.FC<ModalBodyProps> = ({ pendingAmount, symbol }) => {
  return (
    <ModalBodyWrapper>
      <div>
        <p>
          There is already a pending withdrawal of {pendingAmount} {symbol}. If you create a new request, it will delete
          the previous request and create a new one.
        </p>
        <p>
          No funds are lost if you decide to continue, but you will have to wait again for the withdrawal to be
          consolidated.
        </p>
      </div>
      <p>Do you wish to create a new withdrawal request that replaces the previous one?</p>
    </ModalBodyWrapper>
  )
}

const DepositWidget: React.FC = () => {
  const { balances, setBalances, error } = useTokenBalances()
  const { enableToken, deposit, requestWithdraw, claim } = useRowActions({ balances, setBalances })

  const [withdrawRequest, setWithdrawRequest] = useState({
    amount: null,
    tokenAddress: null,
    pendingAmount: null,
    symbol: null,
  })

  const [withdrawConfirmationModal, toggleWithdrawConfirmationModal] = useModali({
    centered: true,
    animated: true,
    title: 'Confirm withdraw overwrite',
    message: <ModalBody pendingAmount={withdrawRequest.pendingAmount} symbol={withdrawRequest.symbol} />,
    buttons: [
      <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => toggleWithdrawConfirmationModal()} />,
      <Modali.Button
        label="Accept"
        key="yes"
        isStyleDefault
        onClick={async (): Promise<void> => {
          // On confirm, do the request
          toggleWithdrawConfirmationModal()
          await requestWithdraw(withdrawRequest.amount, withdrawRequest.tokenAddress)
        }}
      />,
    ],
  })
  const requestWithdrawConfirmation = async (amount: BN, tokenAddress: string): Promise<void> => {
    const { withdrawingBalance, decimals, symbol } = getToken('address', tokenAddress, balances)
    log(`Confirm withdrawal for ${symbol} with withdrawingBalance ${withdrawingBalance}`)
    if (!withdrawingBalance.isZero()) {
      // Storing current values before displaying modal
      setWithdrawRequest({
        amount,
        tokenAddress,
        pendingAmount: formatAmount(withdrawingBalance, decimals),
        symbol,
      })

      // Confirm withdrawal: There's an unclaimed withdraw request
      toggleWithdrawConfirmationModal()
    } else {
      // No need to confirm the withdrawal: No amount is pending to be claimed
      await requestWithdraw(amount, tokenAddress)
    }
  }
  const mounted = useRef(true)
  useEffect(() => {
    return function cleanUp(): void {
      mounted.current = false
    }
  }, [])

  if (balances === undefined) {
    // Loading: Do not show the widget
    return null
  }

  return (
    <Wrapper>
      <Widget>
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
                balances.map(tokenBalances => (
                  <Row
                    key={tokenBalances.addressMainnet}
                    tokenBalances={tokenBalances}
                    onEnableToken={(): Promise<void> => enableToken(tokenBalances.address)}
                    onSubmitDeposit={(balance): Promise<void> => deposit(balance, tokenBalances.address)}
                    onSubmitWithdraw={(balance): Promise<void> => {
                      return requestWithdrawConfirmation(balance, tokenBalances.address)
                    }}
                    onClaim={(): Promise<void> => claim(tokenBalances.address)}
                  />
                ))}
            </tbody>
          </table>
        )}
      </Widget>
      <Modali.Modal {...withdrawConfirmationModal} />
    </Wrapper>
  )
}

export default DepositWidget
