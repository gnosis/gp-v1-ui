import React from 'react'
import Modali from 'modali'
import BN from 'bn.js'

import { Row } from './Row'
import ErrorMsg from 'components/ErrorMsg'
import Widget from 'components/layout/Widget'
import { DepositWidgetWrapper } from './Styled'

import { useTokenBalances } from 'hooks/useTokenBalances'
import { useRowActions } from './useRowActions'
import { useDepositModals } from './useDepositModals'
import useSafeState from 'hooks/useSafeState'
import useWindowSizes from 'hooks/useWindowSizes'

import { log, getToken } from 'utils'
import { ZERO } from 'const'
import { TokenBalanceDetails } from 'types'

interface WithdrawState {
  amount: BN
  tokenAddress: string
}

const DepositWidget: React.FC = () => {
  const { balances, setBalances, error } = useTokenBalances()
  const {
    // Dispatchers
    enableToken,
    depositToken,
    requestWithdrawToken,
    claimToken,
    // State Map
    enabling,
    claiming,
    highlighted,
  } = useRowActions({ balances, setBalances })
  const windowSpecs = useWindowSizes()

  const [withdrawRequest, setWithdrawRequest] = useSafeState<WithdrawState>({
    amount: ZERO,
    tokenAddress: '',
  })

  const {
    withdrawOverwriteModal,
    toggleWithdrawOverwriteModal,
    withdrawAndClaimModal,
    toggleWithdrawAndClaimModal,
  } = useDepositModals({ ...withdrawRequest, requestWithdrawToken })

  const requestWithdrawConfirmation = async (amount: BN, tokenAddress: string, claimable: boolean): Promise<void> => {
    const { withdrawingBalance, symbol } = getToken('address', tokenAddress, balances) as Required<TokenBalanceDetails>

    log(`Confirm withdrawal for ${symbol} with withdrawingBalance ${withdrawingBalance}`)

    if (!withdrawingBalance.isZero()) {
      // Storing current values before displaying modal
      setWithdrawRequest({
        amount,
        tokenAddress,
      })

      claimable ? toggleWithdrawAndClaimModal() : toggleWithdrawOverwriteModal()
    } else {
      // No need to confirm the withdrawal: No amount is pending to be claimed
      await requestWithdrawToken(amount, tokenAddress)
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
                    onSubmitDeposit={(balance): Promise<void> => depositToken(balance, tokenBalances.address)}
                    onSubmitWithdraw={(balance): Promise<void> => {
                      return requestWithdrawConfirmation(balance, tokenBalances.address, tokenBalances.claimable)
                    }}
                    onClaim={(): Promise<void> => claimToken(tokenBalances.address)}
                    claiming={claiming}
                    highlighted={highlighted}
                    enabling={enabling}
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
