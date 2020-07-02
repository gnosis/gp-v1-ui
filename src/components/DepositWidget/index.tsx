import React, { useCallback, useMemo } from 'react'
import Modali from 'modali'
import styled from 'styled-components'
import BN from 'bn.js'

// Utils, const, types
import { logDebug, getToken } from 'utils'
import { ZERO, MEDIA } from 'const'
import { TokenBalanceDetails } from 'types'

// Components
import { CardTable, CardWidgetWrapper } from 'components/Layout/Card'
import ErrorMsg from 'components/ErrorMsg'
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

// Reducer/Actions
import { LocalTokensState } from 'reducers-actions/localTokens'
import { TokenLocalState } from 'reducers-actions'

interface WithdrawState {
  amount: BN
  tokenAddress: string
}

const BalancesWidget = styled(CardWidgetWrapper)`
  ${CardTable} {
    > thead,
    > tbody {
      > tr:not(.cardRowDrawer) {
        > td,
        > th {
          justify-content: flex-end;
          text-align: right;
        }
      }
    }

    > tbody > tr:not(.cardRowDrawer) > td {
      &[data-label='Token'] {
        font-family: var(--font-default);
        letter-spacing: 0;
        line-height: 1.2;
        flex-flow: row nowrap;
      }

      &[data-label='Token'] > div {
        word-break: break-word;

        > b {
          display: block;
          color: var(--color-text-primary);
        }
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
    <BalancesWidget $columns="minmax(13.2rem,0.8fr) repeat(2,minmax(10rem,1fr)) minmax(14.5rem, 1fr) minmax(13.8rem, 0.8fr)">
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
        <CardTable className="balancesOverview" $gap="0 1rem">
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
  // get all token balances, including deprecated
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
