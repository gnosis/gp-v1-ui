import React from 'react'
import Modali from 'modali'
import BN from 'bn.js'

import styled from 'styled-components'
import searchIcon from 'assets/img/search.svg'
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
import { ZERO, MEDIA } from 'const'
import { TokenBalanceDetails } from 'types'

interface WithdrawState {
  amount: BN
  tokenAddress: string
}

const BalanceTools = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin: 0;
  padding: 1.6rem;
  box-sizing: border-box;
  align-items: center;

  > .balances-manageTokens {
    font-size: 1.4rem;
    color: #218dff;
    letter-spacing: 0;
    text-align: right;
    font-weight: var(--font-weight-normal);
    appearance: none;
    outline: 0;
    background: transparent;
    transition: text-decoration 0.2s ease-in-out;

    @media ${MEDIA.mobile} {
      padding: 0;
    }

    &:hover {
      text-decoration: underline;
    }
  }

  > .balances-hideZero {
    display: flex;
    flex-flow: row nowrap;
    font-size: 1.4rem;
    color: #2f3e4e;
    letter-spacing: 0;
    font-weight: var(--font-weight-regular);
    margin: 0 2rem 0 auto;
    cursor: pointer;

    @media ${MEDIA.mobile} {
      margin: 0 1.6rem 0 0;
    }

    > b {
      font-weight: inherit;
      margin: 0 0 0 0.5rem;
    }
  }

  > .balances-searchTokens {
    display: flex;
    width: auto;
    max-width: 100%;
    position: relative;
    height: 5.6rem;

    @media ${MEDIA.mobile} {
      width: 100%;
      height: 4.6rem;
      margin: 0 0 2.4rem;
    }

    > input {
      margin: 0;
      width: 26.6rem;
      max-width: 100%;
      background: #e7ecf3 url(${searchIcon}) no-repeat left 1.6rem center/1.6rem;
      border-radius: 0.6rem 0.6rem 0 0;
      border: 0;
      font-size: 1.4rem;
      line-height: 1;
      box-sizing: border-box;
      border-bottom: 0.2rem solid transparent;
      font-weight: var(--font-weight-normal);
      padding: 0 1rem 0 4.8rem;
      outline: 0;

      @media ${MEDIA.mobile} {
        font-size: 1.3rem;
        width: 100%;
      }

      &::placeholder {
        font-size: inherit;
        color: inherit;
        line-height: inherit;
      }

      &:focus {
        border-bottom: 0.2rem solid #218dff;
        border-color: #218dff;
        color: #218dff;
      }

      &.error {
        border-color: #ff0000a3;
      }

      &.warning {
        border-color: orange;
      }

      &:disabled {
        box-shadow: none;
      }
    }
  }
`

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
          <CardTable className="balancesOverview">
            <BalanceTools>
              <label className="balances-searchTokens">
                <input placeholder="Search token by Name, Symbol" type="text" required />
              </label>
              <label className="balances-hideZero">
                <input type="checkbox" />
                <b>Hide zero balances</b>
              </label>
              <button className="balances-manageTokens">Manage Tokens</button>
            </BalanceTools>
            <thead>
              <tr>
                <th>Token</th>
                <th>Exchange Balance</th>
                <th>Pending Withdrawals</th>
                <th>Wallet Balance</th>
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
