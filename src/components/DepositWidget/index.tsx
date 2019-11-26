import React from 'react'
import Modali, { useModali } from 'modali'
import BN from 'bn.js'

import { Row } from './Row'
import ErrorMsg from 'components/ErrorMsg'
import Widget from 'components/layout/Widget'
import { ModalBodyWrapper, DepositWidgetWrapper } from './Styled'

import { useTokenBalances } from 'hooks/useTokenBalances'
import { useRowActions } from './useRowActions'
import useSafeState from 'hooks/useSafeState'
import useWindowSizes from 'hooks/useWindowSizes'

import { log, formatAmount, getToken } from 'utils'
import { ZERO } from 'const'
import { TokenBalanceDetails } from 'types'

const OverwriteModalBody: React.FC = () => {
  return (
    <ModalBodyWrapper>
      <div>
        <p>You have a pending withdraw request. </p>
        <p>Sending this one will overwrite the pending amount.</p>
        <p>No funds will be lost.</p>
      </div>
      <p>Do you wish to replace the previous withdraw request?</p>
    </ModalBodyWrapper>
  )
}

const WithdrawAndClaimModalBody: React.FC = () => {
  return (
    <ModalBodyWrapper>
      <p>By sending this withdraw request, you will automatically receive all claimable amounts back to your wallet.</p>
    </ModalBodyWrapper>
  )
}

const DepositWidget: React.FC = () => {
  const { balances, setBalances, error } = useTokenBalances()
  const { enableToken, deposit, requestWithdraw, claim } = useRowActions({ balances, setBalances })
  const windowSpecs = useWindowSizes()

  const [withdrawRequest, setWithdrawRequest] = useSafeState({
    amount: ZERO,
    tokenAddress: '',
    pendingAmount: '',
    symbol: '',
  })

  const [withdrawOverwriteModal, toggleWithdrawOverwriteModal] = useModali({
    centered: true,
    animated: true,
    title: 'Confirm withdraw overwrite',
    message: <OverwriteModalBody />,
    buttons: [
      <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => toggleWithdrawOverwriteModal()} />,
      <Modali.Button
        label="Continue"
        key="yes"
        isStyleDefault
        onClick={async (): Promise<void> => {
          // On confirm, do the request
          toggleWithdrawOverwriteModal()
          await requestWithdraw(withdrawRequest.amount, withdrawRequest.tokenAddress)
        }}
      />,
    ],
  })

  const [withdrawAndClaimModal, toggleWithdrawAndClaimModal] = useModali({
    centered: true,
    animated: true,
    title: 'Please note',
    message: <WithdrawAndClaimModalBody />,
    buttons: [
      <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => toggleWithdrawAndClaimModal()} />,
      <Modali.Button
        label="Continue"
        key="yes"
        isStyleDefault
        onClick={async (): Promise<void> => {
          // On confirm, do the request
          toggleWithdrawAndClaimModal()
          await requestWithdraw(withdrawRequest.amount, withdrawRequest.tokenAddress)
        }}
      />,
    ],
  })

  const requestWithdrawConfirmation = async (amount: BN, tokenAddress: string, claimable: boolean): Promise<void> => {
    const { withdrawingBalance, decimals, symbol } = getToken('address', tokenAddress, balances) as Required<
      TokenBalanceDetails
    >
    log(`Confirm withdrawal for ${symbol} with withdrawingBalance ${withdrawingBalance}`)
    if (!withdrawingBalance.isZero()) {
      // Storing current values before displaying modal
      setWithdrawRequest({
        amount,
        tokenAddress,
        pendingAmount: formatAmount(withdrawingBalance, decimals) || '',
        symbol,
      })

      if (claimable) {
        toggleWithdrawAndClaimModal()
      } else {
        // Confirm withdrawal: There's an unclaimed withdraw request
        toggleWithdrawOverwriteModal()
      }
    } else {
      // No need to confirm the withdrawal: No amount is pending to be claimed
      await requestWithdraw(amount, tokenAddress)
    }
  }

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
                      return requestWithdrawConfirmation(balance, tokenBalances.address, tokenBalances.claimable)
                    }}
                    onClaim={(): Promise<void> => claim(tokenBalances.address)}
                    {...windowSpecs}
                  />
                ))}
            </div>
          </div>
        )}
      </Widget>
      <Modali.Modal {...withdrawOverwriteModal} />
      <Modali.Modal {...withdrawAndClaimModal} />
    </DepositWidgetWrapper>
  )
}

export default DepositWidget
