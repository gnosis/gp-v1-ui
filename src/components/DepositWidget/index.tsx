import React, { useCallback, useMemo, useState } from 'react'
import Modali from 'modali'
import styled from 'styled-components'
import BN from 'bn.js'

// Assets
import searchIcon from 'assets/img/search.svg'

// Utils, const, types
import { logDebug, getToken } from 'utils'
import { ZERO, MEDIA } from 'const'
import { TokenBalanceDetails } from 'types'

// Components
import { CardTable, CardWidgetWrapper } from 'components/Layout/Card'
import ErrorMsg from 'components/ErrorMsg'

// DepositWidget: subcomponents
import { Row } from 'components/DepositWidget/Row'
import { useRowActions } from 'components/DepositWidget/useRowActions'
import { useDepositModals } from 'components/DepositWidget/useDepositModals'

// Hooks and reducers
import { useTokenBalances } from 'hooks/useTokenBalances'
import useSafeState from 'hooks/useSafeState'
import useWindowSizes from 'hooks/useWindowSizes'
import { useDebounce } from 'hooks/useDebounce'
import { useManageTokens } from 'hooks/useManageTokens'
import useGlobalState from 'hooks/useGlobalState'
import { useEthBalances } from 'hooks/useEthBalance'

// Reducer/Actions
import { TokenLocalState } from 'reducers-actions'

interface WithdrawState {
  amount: BN
  tokenAddress: string
}

const BalancesWidget = styled(CardWidgetWrapper)`
  ${CardTable} > tbody > tr:not([class^="Card__CardRowDrawer"]) > td {
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
  }
`

const BalanceTools = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  align-items: center;
  order: 1;

  > .balances-manageTokens {
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

  > .balances-hideZero {
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

  > .balances-searchTokens {
    display: flex;
    width: auto;
    max-width: 100%;
    position: relative;
    height: 5.6rem;
    margin: 1.6rem;

    @media ${MEDIA.mobile} {
      width: 100%;
      height: 4.6rem;
      margin: 0 0 2.4rem;
    }

    > input {
      margin: 0;
      width: 35rem;
      max-width: 100%;
      background: var(--color-background-input) url(${searchIcon}) no-repeat left 1.6rem center/1.6rem;
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
      }

      &:focus {
        border-bottom: 0.2rem solid var(--color-text-active);
        border-color: var(--color-text-active);
        color: var(--color-text-active);
      }

      &.error {
        border-color: var(--color-error);
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

  const [search, setSearch] = useState('')
  const [hideZeroBalances, setHideZeroBalances] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)

  const handleHideZeroBalances = (e: React.ChangeEvent<HTMLInputElement>): void => setHideZeroBalances(e.target.checked)

  const { value: debouncedSearch, setImmediate: setDebouncedSearch } = useDebounce(search, 500)

  const clearFilters = (): void => {
    setSearch('')
    setDebouncedSearch('')
    setHideZeroBalances(false)
  }

  const [{ localTokens }] = useGlobalState()

  const filteredBalances = useMemo(() => {
    if ((!debouncedSearch && localTokens.disabled.size === 0) || !balances || balances.length === 0) return balances

    const searchTxt = debouncedSearch.trim().toLowerCase()

    return balances.filter(({ symbol, name, address }) => {
      if (localTokens.disabled.has(address)) return false

      if (searchTxt === '') return true

      return (
        symbol?.toLowerCase().includes(searchTxt) ||
        name?.toLowerCase().includes(searchTxt) ||
        address.toLowerCase().includes(searchTxt)
      )
    })
  }, [debouncedSearch, balances, localTokens.disabled])

  const displayedBalances = useMemo(() => {
    if (!hideZeroBalances || !filteredBalances || filteredBalances.length === 0) return filteredBalances

    return filteredBalances.filter(({ totalExchangeBalance, pendingWithdraw, walletBalance }) => {
      return !totalExchangeBalance.isZero() || !pendingWithdraw.amount.isZero() || !walletBalance.isZero()
    })
  }, [hideZeroBalances, filteredBalances])

  const { modalProps, toggleModal } = useManageTokens()

  return (
    <BalancesWidget $columns="repeat(auto-fit, minmax(5rem, 1fr));">
      <BalanceTools>
        <label className="balances-searchTokens">
          <input
            placeholder="Search token by Name, Symbol or Address"
            type="text"
            value={search}
            onChange={handleSearch}
          />
        </label>
        <label className="balances-hideZero">
          <input type="checkbox" checked={hideZeroBalances} onChange={handleHideZeroBalances} />
          <b>Hide zero balances</b>
        </label>
        <button type="button" className="balances-manageTokens" onClick={toggleModal}>
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
