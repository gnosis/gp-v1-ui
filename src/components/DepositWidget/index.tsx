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

import { logDebug, getToken } from 'utils'
import { ZERO, MEDIA } from 'const'
import { TokenBalanceDetails } from 'types'

interface WithdrawState {
  amount: BN
  tokenAddress: string
}

const BalancesWidget = styled(Widget)`
  display: flex;
  flex-flow: column nowrap;
  width: auto;
  padding: 0 0 2.4rem;
  min-width: 85rem;
  max-width: 140rem;
  background: #ffffff;
  box-shadow: 0 -1rem 4rem 0 rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02) 0 0.276726rem 0.221381rem 0,
    rgba(0, 0, 0, 0.027) 0 0.666501rem 0.532008rem 0, rgba(0, 0, 0, 0.035) 0 1.25216rem 1.0172rem 0,
    rgba(0, 0, 0, 0.043) 0 2.23363rem 1.7869rem 0, rgba(0, 0, 0, 0.05) 0 4.17776rem 3.34221rem 0,
    rgba(0, 0, 0, 0.07) 0 10rem 8rem 0;
  border-radius: 0.6rem;
  margin: 0 auto;
  min-height: 54rem;
  font-size: 1.6rem;
  line-height: 1;
  justify-content: flex-start;
  
    @media ${MEDIA.tablet} {
      min-width: 100vw;
      min-width: calc(100vw - 4.8rem);
      width: 100%;
      max-width: 100%;
    }

    @media ${MEDIA.mobile} {
      max-width: 100%;
      min-width: initial;
      width: 100%;

      > div {
        flex-flow: row wrap;
      }
    }
    
  ${CardTable}.balancesOverview {
    display: flex;
    flex-flow: column nowrap;
    width: auto;
    order: 2;
  }

  ${CardTable}.balancesOverview > tbody {
    font-size: 1.3rem;
    line-height: 1;

    @media ${MEDIA.mobile} {
      display: flex;
      flex-flow: column wrap;
      width: 100%;
    }
  }

  ${CardTable}.balancesOverview > thead {
    background: #ffffff;
    border-radius: 0.6rem;

    @media ${MEDIA.mobile} {
      display: none;
    }
  }

  ${CardTable}.balancesOverview > thead > tr:not([class^="Card__CardRowDrawer"]),
  ${CardTable}.balancesOverview > tbody > tr:not([class^="Card__CardRowDrawer"]) {
    grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
    text-align: right;
    padding: 0.8rem;
    margin: 0;
    justify-content: flex-start;

    @media ${MEDIA.mobile} {
      padding: 1.6rem 0.8rem;
      display: table;
      flex-flow: column wrap;
      width: 100%;
      border-bottom: 0.2rem solid rgba(159, 180, 201, 0.5);
    }
  }

  ${CardTable}.balancesOverview > thead > tr:not([class^="Card__CardRowDrawer"]) > th {
    font-size: 1.1rem;
    color: #2f3e4e;
    letter-spacing: 0;
    text-align: right;
    padding: 0.8rem;
    text-transform: uppercase;

    &:first-of-type {
      text-align: left;
    }
  }

  ${CardTable}.balancesOverview > tbody > tr:not([class^="Card__CardRowDrawer"]) > td {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 0 0.5rem;
    text-align: right;
    justify-content: flex-end;
    word-break: break-all;
    white-space: normal;

    @media ${MEDIA.mobile} {
      width: 100%;
      border-bottom: 0.1rem solid rgba(0, 0, 0, 0.14);
      padding: 1rem 0.5rem;
      flex-flow: row nowrap;

      &:last-of-type {
        border: 0;
      }
    }

    &:first-of-type {
      text-align: left;
      justify-content: flex-start;
    }

    &[data-label='Token'] {
      font-family: var(--font-default);
      letter-spacing: 0;
      line-height: 1.2;
      flex-flow: row nowrap;
    }

    &[data-label='Token'] > div > b {
      display: block;
      color: #2f3e4e;
    }

    &::before {
      @media ${MEDIA.mobile} {
        content: attr(data-label);
        margin-right: auto;
        font-weight: var(--font-weight-bold);
        text-transform: uppercase;
        font-size: 1rem;
        font-family: var(--font-default);
        letter-spacing: 0;
        white-space: nowrap;
        padding: 0 0.5rem 0 0;
        color: #2f3e4e;
      }
    }

    > div {
      @media ${MEDIA.mobile} {
        text-align: right;
      }
    }
  }
`

const BalanceTools = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin: 0;
  padding: 1.6rem;
  box-sizing: border-box;
  align-items: center;
  order: 1;

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
      width: 28rem;
      max-width: 100%;
      background: #e7ecf3 url(${searchIcon}) no-repeat left 1.6rem center/1.6rem;
      border-radius: 0.6rem 0.6rem 0 0;
      border: 0;
      font-size: 1.4rem;
      line-height: 1;
      box-sizing: border-box;
      border-bottom: 0.2rem solid transparent;
      font-weight: var(--font-weight-normal);
      padding: 0 1.6rem 0 4.8rem;
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

    logDebug(`[DepositWidget] Confirm withdraw for ${symbol} with withdrawingBalance ${withdrawingBalance}`)

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
      <BalancesWidget>
        <BalanceTools>
          <label className="balances-searchTokens not-implemented">
            <input placeholder="Search token by Name, Symbol" type="text" required />
          </label>
          <label className="balances-hideZero not-implemented">
            <input type="checkbox" />
            <b>Hide zero balances</b>
          </label>
          <button type="button" className="balances-manageTokens not-implemented">
            Manage Tokens
          </button>
        </BalanceTools>
        {error ? (
          <ErrorMsg title="oops..." message="Something happened while loading the balances" />
        ) : (
          <CardTable className="balancesOverview">
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
      </BalancesWidget>
      <Modali.Modal {...withdrawOverwriteModal} />
      <Modali.Modal {...withdrawAndClaimModal} />
    </section>
  )
}

export default DepositWidget
