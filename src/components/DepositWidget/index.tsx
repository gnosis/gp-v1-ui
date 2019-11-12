import React, { useEffect, useRef, useState } from 'react'
import Modali, { useModali } from 'modali'
import BN from 'bn.js'

import { Row } from './Row'
import ErrorMsg from 'components/ErrorMsg'
import Widget from 'components/layout/Widget'
import { ModalBodyWrapper, DepositWidgetWrapper } from './Styled'

import { useTokenBalances } from 'hooks/useTokenBalances'
import { useRowActions } from './useRowActions'
import useWindowSizes from 'hooks/useWindowSizes'

import { log, formatAmount, getToken } from 'utils'

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
  const windowSpecs = useWindowSizes()

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
    <DepositWidgetWrapper>
      <Widget>
        {error ? (
          <ErrorMsg title="oops..." message="Something happened while loading the balances" />
        ) : (
          <div className="gridContainer">
            <div className="headerContainer">
              <div className="row">Token</div>
              <div className="row">Exchange wallet</div>
              <div className="row">Pending withdrawals</div>
              <div className="row">Wallet</div>
              <div className="row">Actions</div>
            </div>
            <div className="rowContainer">
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
                    {...windowSpecs}
                  />
                ))}
            </div>
          </div>
        )}
      </Widget>
      <Modali.Modal {...withdrawConfirmationModal} />
    </DepositWidgetWrapper>
  )
}

export default DepositWidget
