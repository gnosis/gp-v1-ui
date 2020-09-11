import React, { useCallback, useMemo } from 'react'
import Modali from 'modali'
import styled from 'styled-components'
import BN from 'bn.js'

// Utils, const, types
import { logDebug, getToken } from 'utils'
import { checkTokenAgainstSearch } from 'utils/filter'
import { ZERO, MEDIA } from 'const'
import { TokenBalanceDetails } from 'types'

// Components
import ErrorMsg from 'components/ErrorMsg'
import FilterTools from 'components/FilterTools'
import { CardTable, CardWidgetWrapper } from 'components/layout/SwapLayout/Card'
import { StandaloneCardWrapper } from 'components/layout'

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
import { TokenLocalState } from 'reducers-actions'

interface WithdrawState {
  amount: BN
  tokenAddress: string
}

export const BalancesWidget = styled(CardWidgetWrapper)`
  background: var(--color-background-pageWrapper);
  height: 100%;

  > .filterToolsBar {
    height: 10%;
  }

  > ${CardTable} {
    height: 90%;
    overflow: hidden;

    > thead,
    > tbody {
      font-size: 1.3rem;

      > tr:not(.cardRowDrawer) {
        min-height: 6.3rem;
        > td,
        > th {
          justify-content: flex-end;
          text-align: right;
        }
      }
    }

    > thead {
      > tr:not(.cardRowDrawer) {
        padding: 0.8rem 3rem;
      }
    }

    > tbody {
      overflow-y: auto;

      > tr:not(.cardRowDrawer) {
        padding: 0.8rem 1.6rem;
        > td {
          &[data-label='Token'] {
            font-family: var(--font-default);
            letter-spacing: 0;
            line-height: 1.2;
            flex-flow: row nowrap;

            > div {
              word-break: break-word;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              > strong {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: flex-start;
              }

              > b {
                display: block;
                color: var(--color-text-primary);
              }
            }

            @media ${MEDIA.mobile} {
              > img {
                margin: 0 0 0 1rem;
                order: 1;
              }
              > div {
                order: 0;
                text-align: right;
                white-space: normal;

                > strong {
                  justify-content: flex-end;
                  > a,
                  > img {
                    order: 0;
                    margin-right: 0.4rem;
                    margin-left: 0;

                    > img {
                      margin: 0;
                    }
                  }
                  > span {
                    order: 1;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // button
  .balances-manageTokens {
    color: var(--color-text-active);
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
    color: var(--color-text-primary);
    font-weight: var(--font-weight-regular);
    margin: 0 2rem;
    cursor: pointer;

    > b {
      font-weight: inherit;
      margin: 0 0 0 0.5rem;
    }
  }

  .balances-hideZero,
  .balances-manageTokens {
    white-space: nowrap;
    font-size: 1.4rem;
    letter-spacing: 0;

    @media ${MEDIA.mobile} {
      margin: 0 1.6rem 1.6rem;
    }
  }
`

const NoTokensMessage = styled.tr`
  /* increase speicifcity */
  &&&&&& {
    grid-template-columns: auto;
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
  claimToken: (tokenAddress: string, onTxHash?: (hash: string) => void) => Promise<void | React.ReactText>
  ethBalance: BN | null
  balances: TokenBalanceDetails[]
  error: boolean
  requestWithdrawConfirmation(
    amount: BN,
    tokenAddress: string,
    claimable: boolean,
    onTxHash: (hash: string) => void,
  ): Promise<void>
  hasTokensToShow?: boolean
}

const customFilterFnFactory = (searchTxt: string) => (token: TokenBalanceDetails): boolean => {
  if (searchTxt === '') return true

  return checkTokenAgainstSearch(token, searchTxt)
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
  immatureClaim,
  requestWithdrawConfirmation,
  hasTokensToShow = false,
}) => {
  const windowSpecs = useWindowSizes()

  const [{ localTokens }] = useGlobalState()

  const memoizedSearchFilterParams = useMemo(
    () => ({
      data: balances,
      filterFnFactory: customFilterFnFactory,
      userConditionalCheck: ({ debouncedSearch }: { debouncedSearch: string }): boolean =>
        !debouncedSearch && localTokens.disabled.size === 0,
    }),
    [balances, localTokens],
  )

  const {
    filteredData: filteredBalances,
    search,
    handlers: { handleSearch, clearFilters: clearFilters1 },
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
    handlers: { handleToggleFilter: handleHideZeroBalances, clearFilters: clearFilters2 },
  } = useDataFilter(memoizedZeroFilterParams)

  const clearFilters = useCallback(() => {
    clearFilters1()
    clearFilters2()
  }, [clearFilters1, clearFilters2])

  const { modalProps, toggleModal } = useManageTokens()

  return (
    <StandaloneCardWrapper>
      <BalancesWidget $columns="20rem repeat(2,minmax(10rem,1fr)) minmax(14.5rem, 1fr) minmax(13.8rem, 0.8fr)">
        <FilterTools
          className="filterToolsBar"
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
              {displayedBalances && displayedBalances.length > 0 ? (
                displayedBalances.map((tokenBalances) => (
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
                    onClaim={(): Promise<void | React.ReactText> => claimToken(tokenBalances.address)}
                    claiming={claiming.has(tokenBalances.address)}
                    withdrawing={withdrawing.has(tokenBalances.address)}
                    depositing={depositing.has(tokenBalances.address)}
                    highlighted={highlighted.has(tokenBalances.address)}
                    enabling={enabling.has(tokenBalances.address)}
                    enabled={enabled.has(tokenBalances.address)}
                    immatureClaim={immatureClaim.has(tokenBalances.address)}
                    {...windowSpecs}
                  />
                ))
              ) : balances.length === 0 && hasTokensToShow ? (
                <NoTokensMessage>
                  <td>
                    All tokens disabled. Enable some in <a onClick={toggleModal}>Manage Tokens</a>
                  </td>
                </NoTokensMessage>
              ) : (
                (search || hideZeroBalances) && (
                  <NoTokensMessage>
                    <td>
                      No enabled tokens match provided filters <a onClick={clearFilters}>clear filters</a>
                    </td>
                  </NoTokensMessage>
                )
              )}
            </tbody>
          </CardTable>
        )}
        <Modali.Modal {...modalProps} />
      </BalancesWidget>
    </StandaloneCardWrapper>
  )
}

const BalancesDisplayMemoed = React.memo(BalancesDisplay)

const DepositWidget: React.FC = () => {
  const { ethBalance } = useEthBalances()
  // get all token balances, including deprecated
  const { balances: allBalances, error } = useTokenBalances()

  const [{ localTokens }] = useGlobalState()

  const balances = useMemo(() => {
    return allBalances.filter((bal) => !localTokens.disabled.has(bal.address))
  }, [allBalances, localTokens.disabled])

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
    <>
      <BalancesDisplayMemoed
        ethBalance={ethBalance}
        balances={balances}
        hasTokensToShow={allBalances.length > 0}
        error={error}
        {...restActions}
        requestWithdrawConfirmation={requestWithdrawConfirmation}
      />
      <Modali.Modal {...withdrawOverwriteModal} />
      <Modali.Modal {...withdrawAndClaimModal} />
    </>
  )
}

export default DepositWidget
