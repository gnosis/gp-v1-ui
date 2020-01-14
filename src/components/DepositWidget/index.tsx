import React from 'react'
import Modali from 'modali'
import BN from 'bn.js'

import { CardTable } from 'components/Layout/Card'
import { Row } from './Row'
import ErrorMsg from 'components/ErrorMsg'
import Widget from 'components/Layout/Widget'

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
  const { balances, error } = useTokenBalances()
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
  } = useRowActions({ balances })
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
    const {
      pendingWithdraw: { amount: withdrawingBalance },
      symbol,
    } = getToken('address', tokenAddress, balances) as Required<TokenBalanceDetails>

    log(`Confirm withdraw for ${symbol} with withdrawingBalance ${withdrawingBalance}`)

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
    <section>
      <Widget>
        {error ? (
          <ErrorMsg title="oops..." message="Something happened while loading the balances" />
        ) : (
          <CardTable $columns="var(--grid-row-size-walletPage)">
            <thead>
              <tr>
                <th>Token</th>
                <th>Exchange wallet</th>
                <th>Pending withdrawals</th>
                <th>Wallet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </CardTable>
        )}
      </Widget>
      <Modali.Modal {...withdrawOverwriteModal} />
      <Modali.Modal {...withdrawAndClaimModal} />
    </section>
  )
}

export default DepositWidget
