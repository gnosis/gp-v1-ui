import React, { useCallback, useMemo } from 'react'
import Modali from 'modali'
import styled from 'styled-components'
import BN from 'bn.js'

// Utils, const, types
import { logDebug, getToken } from 'utils'
import { ZERO, MEDIA } from 'const'
import { TokenBalanceDetails } from 'types'
import { LocalTokensState } from 'reducers-actions/localTokens'
import { TokenLocalState } from 'reducers-actions'

// Components
import { CardTable } from 'components/Layout/Card'
import ErrorMsg from 'components/ErrorMsg'
import Widget from 'components/Layout/Widget'
import FilterTools from 'components/FilterTools'

// DepositWidget: subcomponents
import { Row } from 'components/DepositWidget/Row'
import { useRowActions } from 'components/DepositWidget/useRowActions'
import { useDepositModals } from 'components/DepositWidget/useDepositModals'

// Hooks and reducers
import { useTokenBalances } from 'hooks/useTokenBalances'
import useSafeState from 'hooks/useSafeState'
import useWindowSizes from 'hooks/useWindowSizes'
import { useManageTokens } from 'hooks/useManageTokens'
import useGlobalState from 'hooks/useGlobalState'
import { useEthBalances } from 'hooks/useEthBalance'
import useDataFilter from 'hooks/useDataFilter'

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
  background: var(--color-background-pageWrapper);
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
    background: var(--color-background);
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
    color: var(--color-text-primary);
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
      color: var(--color-text-primary);
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
        color: var(--color-text-primary);
      }
    }
  }
  // button
  .balances-manageTokens {
    font-size: 1.4rem;
    color: var(--color-text-active);
    letter-spacing: 0;
    text-align: right;
    font-weight: var(--font-weight-normal);
    appearance: none;
    outline: 0;
    background: transparent;
    transition: text-decoration 0.2s ease-in-out;
    padding: 0;
    margin: 0 1.6rem;

    @media ${MEDIA.mobile} {
      padding: 0;
    }

    &:hover {
      text-decoration: underline;
    }
  }

  // label + radio input
  .balances-hideZero {
    display: flex;
    flex-flow: row nowrap;
    font-size: 1.4rem;
    color: var(--color-text-primary);
    letter-spacing: 0;
    font-weight: var(--font-weight-regular);
    margin: 0 2rem 0 auto;
    cursor: pointer;

    @media ${MEDIA.mobile} {
      margin: 0 1.6rem 1.6rem;
    }

    > b {
      font-weight: inherit;
      margin: 0 0 0 0.5rem;
    }
  }
`

const NoTokensMessage = styled.tr`
  /* increase speicifcity */
  &&&&&& {
    margin: auto;
    border: none;

    :hover {
      background: initial;
    }

    a {
      color: var(--color-text-active);
    }

    > td {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      min-height: 3.5em;
      line-height: 1.5;
    }
  }
`

interface BalanceDisplayProps extends TokenLocalState {
  enableToken: (tokenAddress: string, onTxHash?: (hash: string) => void) => Promise<void>
  depositToken: (amount: BN, tokenAddress: string, onTxHash?: (hash: string) => void) => Promise<void>
  claimToken: (tokenAddress: string, onTxHash?: (hash: string) => void) => Promise<void>
  ethBalance: BN | null
  balances: TokenBalanceDetails[]
  error: boolean
  requestWithdrawConfirmation(
    amount: BN,
    tokenAddress: string,
    claimable: boolean,
    onTxHash: (hash: string) => void,
  ): Promise<void>
}

const customFilterFnFactory = (localTokens: LocalTokensState) => (searchTxt: string) => ({
  symbol,
  name,
  address,
}: TokenBalanceDetails): boolean => {
  if (localTokens.disabled.has(address)) return false

  if (searchTxt === '') return true

  return (
    symbol?.toLowerCase().includes(searchTxt) ||
    name?.toLowerCase().includes(searchTxt) ||
    address.toLowerCase().includes(searchTxt)
  )
}

const customHideZeroFilterFn = ({
  totalExchangeBalance,
  pendingWithdraw,
  walletBalance,
}: TokenBalanceDetails): boolean => {
  return !totalExchangeBalance.isZero() || !pendingWithdraw.amount.isZero() || !walletBalance.isZero()
}

const BalancesDisplay: React.FC<BalanceDisplayProps> = ({
  ethBalance,
  balances,
  error,
  enableToken,
  depositToken,
  claimToken,
  claiming,
  withdrawing,
  depositing,
  highlighted,
  enabling,
  enabled,
  requestWithdrawConfirmation,
}) => {
  const windowSpecs = useWindowSizes()

  const [{ localTokens }] = useGlobalState()

  const memoizedSearchFilterParams = useMemo(
    () => ({
      data: balances,
      filterFnFactory: customFilterFnFactory(localTokens),
      userConditionalCheck: ({ debouncedSearch }: { debouncedSearch: string }): boolean =>
        !debouncedSearch && localTokens.disabled.size === 0,
    }),
    [balances, localTokens],
  )

  const {
    filteredData: filteredBalances,
    search,
    handlers: { handleSearch },
  } = useDataFilter(memoizedSearchFilterParams)

  const memoizedZeroFilterParams = useMemo(
    () => ({
      data: filteredBalances,
      isSearchFilter: false,
      filterFnFactory: (): typeof customHideZeroFilterFn => customHideZeroFilterFn,
    }),
    [filteredBalances],
  )

  const {
    filteredData: displayedBalances,
    showFilter: hideZeroBalances,
    handlers: { handleToggleFilter: handleHideZeroBalances, clearFilters },
  } = useDataFilter(memoizedZeroFilterParams)

  const { modalProps, toggleModal } = useManageTokens()

  return (
    <BalancesWidget>
      <FilterTools
        resultName="tokens"
        searchValue={search}
        handleSearch={handleSearch}
        showFilter={(!!search || hideZeroBalances) && displayedBalances?.length > 0}
        dataLength={displayedBalances.length}
      >
        <label className="balances-hideZero">
          <input type="checkbox" checked={hideZeroBalances} onChange={handleHideZeroBalances} />
          <b>Hide zero balances</b>
        </label>
        <button type="button" className="balances-manageTokens" onClick={toggleModal}>
          Manage Tokens
        </button>
      </FilterTools>
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
            {displayedBalances && displayedBalances.length > 0
              ? displayedBalances.map(tokenBalances => (
                  <Row
                    key={tokenBalances.address}
                    ethBalance={ethBalance}
                    tokenBalances={tokenBalances}
                    onEnableToken={(): Promise<void> => enableToken(tokenBalances.address)}
                    onSubmitDeposit={(balance, onTxHash): Promise<void> =>
                      depositToken(balance, tokenBalances.address, onTxHash)
                    }
                    onSubmitWithdraw={(balance, onTxHash): Promise<void> => {
                      return requestWithdrawConfirmation(
                        balance,
                        tokenBalances.address,
                        tokenBalances.claimable,
                        onTxHash,
                      )
                    }}
                    onClaim={(): Promise<void> => claimToken(tokenBalances.address)}
                    claiming={claiming.has(tokenBalances.address)}
                    withdrawing={withdrawing.has(tokenBalances.address)}
                    depositing={depositing.has(tokenBalances.address)}
                    highlighted={highlighted.has(tokenBalances.address)}
                    enabling={enabling.has(tokenBalances.address)}
                    enabled={enabled.has(tokenBalances.address)}
                    {...windowSpecs}
                  />
                ))
              : (search || hideZeroBalances) && (
                  <NoTokensMessage>
                    <td>
                      No enabled tokens match provided filters <a onClick={clearFilters}>clear filters</a>
                    </td>
                  </NoTokensMessage>
                )}
          </tbody>
        </CardTable>
      )}
      <Modali.Modal {...modalProps} />
    </BalancesWidget>
  )
}

const BalancesDisplayMemoed = React.memo(BalancesDisplay)

const DepositWidget: React.FC = () => {
  const { ethBalance } = useEthBalances()
  const { balances, error } = useTokenBalances()

  const { requestWithdrawToken, ...restActions } = useRowActions({ balances })

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

  const requestWithdrawConfirmation = useCallback(
    async (amount: BN, tokenAddress: string, claimable: boolean, onTxHash: (hash: string) => void): Promise<void> => {
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
        await requestWithdrawToken(amount, tokenAddress, onTxHash)
      }
    },
    [balances, requestWithdrawToken, setWithdrawRequest, toggleWithdrawAndClaimModal, toggleWithdrawOverwriteModal],
  )

  if (balances === undefined) {
    // Loading: Do not show the widget
    return null
  }

  return (
    <section>
      <BalancesDisplayMemoed
        ethBalance={ethBalance}
        balances={balances}
        error={error}
        {...restActions}
        requestWithdrawConfirmation={requestWithdrawConfirmation}
      />
      <Modali.Modal {...withdrawOverwriteModal} />
      <Modali.Modal {...withdrawAndClaimModal} />
    </section>
  )
}

export default DepositWidget
