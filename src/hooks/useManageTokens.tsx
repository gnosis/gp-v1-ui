import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import Modali, { useModali, ModalHook } from 'modali'
import { TokenDetails } from 'types'
import styled from 'styled-components'
import { useWalletConnection } from './useWalletConnection'
import { useTokenList } from './useTokenList'
import { OptionItem, SearchItem } from 'components/TokenOptionItem'
import { useDebounce } from './useDebounce'
import searchIcon from 'assets/img/search.svg'
import { useBetterAddTokenModal } from './useBetterAddTokenModal'
import useGlobalState from 'hooks/useGlobalState'
import { updateLocalTokens } from 'reducers-actions/localTokens'

const OptionWrapper = styled.div`
  font-family: var(--font-default);
  text-rendering: geometricPrecision;
  line-height: 1;
  color: inherit;
  display: flex;
  font-size: inherit;
  padding: 8px 12px;
  user-select: none;
  box-sizing: border-box;
  border: 0.1rem solid var(--color-background-banner);
  align-items: center;
  min-height: 5.6rem;
  transition: background 0.2s ease-in-out;

  flex: 50% 0 0;

  :hover {
    background: rgba(33, 141, 255, 0.1);
  }
`

const SearchItemWrapper = styled(OptionWrapper)`
  flex-basis: 100%;

  :hover {
    background: initial;
  }
`

const TokenListWrapper = styled.div`
  max-width: 160rem;
  overflow: auto;
  height: 70vh;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  align-content: flex-start;

  label {
    padding: 1em;
    margin: 0 10% 0 auto;
    cursor: pointer;
  }
`

interface TokenListProps {
  tokens: TokenDetails[]
  disabledTokens: Set<string>
  onToggleToken: (address: string, enabled: boolean) => void
}

const TokenList: React.FC<TokenListProps> = ({ tokens, onToggleToken, disabledTokens }) => {
  return (
    <>
      {tokens.map(token => {
        const { name, symbol, image, address } = token
        return (
          <OptionWrapper key={address}>
            <OptionItem name={name} symbol={symbol} image={image}>
              <label>
                <input
                  type="checkbox"
                  checked={!disabledTokens.has(address)}
                  onChange={(e): void => {
                    onToggleToken(address, e.target.checked)
                  }}
                />
              </label>
            </OptionItem>
          </OptionWrapper>
        )
      })}
    </>
  )
}

const SearchWrapper = styled.div`
  display: flex;

  input {
    margin: 0;
    /* width: 100%; */
    border: 0;
    border-bottom: 0.2rem solid transparent;
    outline: 0;
    font-size: 1.4rem;
    font-weight: var(--font-weight-normal);
    background: var(--color-background-input) url(${searchIcon}) no-repeat left 1.6rem center/1.6rem;
    border-radius: 0;
    padding: 0px 1.6rem 0px 4.8rem;
    height: 3em;

    &:focus {
      border-bottom: 0.2rem solid var(--color-text-active);
      border-color: var(--color-text-active);
      color: var(--color-text-active);
    }
  }
`

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>

const SearchInput: React.FC<SearchInputProps> = props => {
  return (
    <SearchWrapper>
      <input
        autoFocus
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
        type="text"
        placeholder="Search by token Name, Symbol or Address"
        {...props}
        // value={inputValue}
        // onChange={onChange}
        // onKeyPress={wrappedOnKeyDown}
      />
    </SearchWrapper>
  )
}

const ManageTokensContainer: React.FC = () => {
  const { networkId, networkIdOrDefault } = useWalletConnection()
  const tokens = useTokenList(networkId)

  const [search, setSearch] = useState('')
  const { value: debouncedSearch, setImmediate: setDebouncedSearch } = useDebounce(search, 500)

  const { modalProps, addTokensToList } = useBetterAddTokenModal()

  const filteredTokens = useMemo(() => {
    if (!debouncedSearch || !tokens || tokens.length === 0) return tokens

    const searchTxt = debouncedSearch.toLowerCase()

    // same search logic as in react-select
    // so partial addresses also match
    return tokens.filter(({ symbol, name, address }) => {
      return (
        symbol?.toLowerCase().includes(searchTxt) ||
        name?.toLowerCase().includes(searchTxt) ||
        address.toLowerCase().includes(searchTxt)
      )
    })
  }, [debouncedSearch, tokens])

  const tokensShown = filteredTokens.length > 0

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = e.target
      setSearch(value)

      // don't debounce when looking to add token
      // for faster fetch start
      if (!tokensShown) setDebouncedSearch(value)
    },
    [tokensShown, setDebouncedSearch],
  )

  const [{ localTokens }, dispatch] = useGlobalState()

  const [tokensDisabledState, setDisabledTokens] = useState(localTokens.disabled)
  const disabledTokensRef = useRef<typeof localTokens.disabled>(localTokens.disabled)
  // keep track to access on unmount
  disabledTokensRef.current = tokensDisabledState

  const toggleTokenState = useCallback((address: string, enabled: boolean): void => {
    setDisabledTokens(oldSet => {
      const newDisabledSet = new Set(oldSet)

      if (enabled) newDisabledSet.delete(address)
      else newDisabledSet.add(address)

      return newDisabledSet
    })
  }, [])

  useEffect(
    () => (): void => {
      // when modal closed
      // update enabled/disabled tokens

      dispatch(updateLocalTokens({ disabled: disabledTokensRef.current }))
    },
    [dispatch],
  )

  return (
    <div>
      <SearchInput onChange={handleSearch} value={search} />
      <TokenListWrapper>
        {!tokensShown ? (
          <SearchItemWrapper>
            <SearchItem
              value={search}
              defaultText="Nothing found"
              networkId={networkIdOrDefault}
              addTokensToList={addTokensToList}
            />
          </SearchItemWrapper>
        ) : (
          <TokenList tokens={filteredTokens} disabledTokens={tokensDisabledState} onToggleToken={toggleTokenState} />
        )}
      </TokenListWrapper>
      <Modali.Modal {...modalProps} />
    </div>
  )
}

interface UseManageTokensResult {
  modalProps: ModalHook
  toggleModal: () => void
}

export const useManageTokens = (): UseManageTokensResult => {
  const [modalProps, toggleModal] = useModali({
    animated: true,
    centered: true,
    title: 'Manage your Token list',
    message: <ManageTokensContainer />,
  })

  return {
    modalProps,
    toggleModal,
  }
}
