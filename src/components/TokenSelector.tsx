import React, { CSSProperties, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import styled from 'styled-components'
import Select, { ActionMeta } from 'react-select'
import { MEDIA } from 'const'

import { formatAmount } from '@gnosis.pm/dex-js'
import { isAddress } from 'web3-utils'
import Modali from 'modali'

import { TokenDetails, TokenBalanceDetails, Network } from 'types'
import { TokenImgWrapper } from './TokenImg'
import { FormatOptionLabelContext } from 'react-select/src/Select'
import { MenuList } from './TokenSelectorComponents'
import searchIcon from 'assets/img/search.svg'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { tokenListApi } from 'api'
import useSafeState from 'hooks/useSafeState'
import { SearchItem, OptionItem } from './TokenOptionItem'
import { useBetterAddTokenModal } from 'hooks/useBetterAddTokenModal'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0;

  label {
    text-transform: uppercase;
    padding-left: 0.5rem; // to align with Select input padding
  }

  input {
    margin-left: 0; // to fix extra space on Select search box
  }

  .tokenBalance {
    font-weight: bold;
    align-self: center;
  }

  .tokenSelectBox {
    position: relative;
    .react-select__menu {
      .menulist-head {
        position: absolute;
        bottom: 100%;
        background-color: inherit;
        width: 100%;
        border-radius: 0.6rem;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        > button {
          background-color: transparent;
          font-size: 4rem;
          line-height: 1;
          color: #526877;
          opacity: 0.5;
          font-family: var(--font-mono);
          font-weight: var(--font-weight-regular);
          transition: opacity 0.2s ease-in-out;

          &:hover {
            opacity: 1;
          }
        }

        > h2 {
          margin-left: 1em;
          font-size: 1.5rem;
        }
      }

      .searchContainer {
        display: flex;

        > input {
          max-width: 100%;
          font-size: 1.4rem;
          font-weight: var(--font-weight-normal);
          background: var(--color-background-input) url(${searchIcon}) no-repeat left 1.6rem center/1.6rem;
          border-radius: 0;
          padding: 0px 1.6rem 0px 4.8rem;
          height: 3em;
        }
      }

      &::before {
        @media ${MEDIA.mediumUp} {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.14);
          border-radius: 0.6rem;
          z-index: -1;
          width: 100%;
          height: 100%;
        }
      }

      @media ${MEDIA.mobile} {
        top: initial;
        height: 75vh;
        box-shadow: 0 0 0 999vw rgba(47, 62, 78, 0.5);
      }
    }
    .react-select__option {
      @media ${MEDIA.mobile} {
        height: 5.6rem;
      }

      &--is-focused {
        background: rgba(33, 141, 255, 0.1);
      }
    }
  }
`

const StyledSelect = styled(Select)`
  display: flex;
  align-items: center;
`

const SelectedTokenWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  color: var(--color-text-primary);
  letter-spacing: -0.05rem;
  text-align: right;
`

function renderOptionLabel(token: TokenDetails | TokenBalanceDetails): React.ReactNode {
  const { name, symbol, image, decimals } = token
  return (
    <OptionItem name={name} symbol={symbol} image={image}>
      {'totalExchangeBalance' in token && (
        <div className="tokenBalance">{formatAmount(token.totalExchangeBalance, decimals)}</div>
      )}
    </OptionItem>
  )
}

function formatOptionLabel(
  options: { token: TokenDetails },
  labelMeta: { context: FormatOptionLabelContext },
): React.ReactNode {
  const { token } = options
  const { context } = labelMeta
  return context === 'value' ? (
    <span>
      <SelectedTokenWrapper>
        <TokenImgWrapper src={token.image} alt={token.name} />
        <strong>{token.symbol}</strong>
      </SelectedTokenWrapper>
    </span>
  ) : (
    renderOptionLabel(token)
  )
}

const customSelectStyles = {
  control: (): CSSProperties & { '&:hover': CSSProperties } => ({
    borderColor: 'var(--color-background-selected)',
    borderStyle: 'solid',
    borderWidth: '.1rem',
    margin: 'auto 0',
    borderRadius: '15rem',
    background: 'var(--color-background)',
    cursor: 'pointer',
    display: 'flex',
    flexFlow: 'row nowrap',
    '&:hover': {
      opacity: '1',
      borderColor: 'var(--color-text-primary)',
    },
  }),
  menu: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    height: '50vh',
    position: 'fixed',
    left: '0',
    right: '0',
    top: '0',
    bottom: '0',
    margin: 'auto',
    width: '42rem',
    minWidth: '30rem',
    background: 'var(--color-background-pageWrapper)',
    color: 'var(--color-text-primary)',
    zIndex: 999,
    boxShadow: '0 999vh 0 999vw rgba(47, 62, 78, 0.50)',
    borderRadius: '0.6rem',
  }),
  menuList: (): CSSProperties => ({
    height: '100%',
    overflow: 'auto',
    borderRadius: '0 0 0.6rem 0.6rem',
    padding: '0 0 5rem 0',
    background: 'var(--color-background-pageWrapper)',
  }),
  input: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    width: '100%',
    position: 'absolute',
    zIndex: -1,
  }),
  option: (provided: CSSProperties): CSSProperties & { '&:hover': CSSProperties } => ({
    ...provided,
    background: 'none',
    cursor: 'pointer',
    borderBottom: '0.1rem solid var(--color-background-banner)',
    display: 'flex',
    alignItems: 'center',
    minHeight: '5.6rem',
    transition: 'background .2s ease-in-out',
    '&:hover': {
      background: 'rgba(33,141,255,0.1);',
    },
  }),
  valueContainer: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    minWidth: '4.5rem',
    padding: '.2rem 0 .2rem .8rem',
  }),
  indicatorSeparator: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    display: 'none',
  }),
  dropdownIndicator: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    color: 'var(--color-text-primary)',
    opacity: '1',
  }),
  singleValue: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    color: 'var(--color-text-primary)',
    maxWidth: `initial`,
    position: `relative`,
    display: `flex`,
    alignItems: `center`,
    transform: `none`,
    top: `initial`,
  }),
}

const components = { MenuList }

const NO_OPTIONS_MESSAGE = 'No results'

interface Props {
  label?: string
  isDisabled?: boolean
  tokens: TokenDetails[]
  selected: TokenDetails
  onChange: (selected: TokenDetails) => void
  tabIndex?: number
}

const stopEnterPropagation: React.KeyboardEventHandler<HTMLDivElement> = e => {
  if (e.key === 'Enter') {
    e.preventDefault()
  }
}

const TokenSelector: React.FC<Props> = ({ isDisabled, tokens, selected, onChange, tabIndex = 0 }) => {
  const options = useMemo(
    () => tokens.map(token => ({ token, value: `${token.symbol} ${token.address}`, label: token.name })),
    [tokens],
  )

  // isFocused is used to force the menu to remain open and give focus to the search input
  const [isFocused, setIsFocused] = useState(false)

  const { networkId } = useWalletConnection()

  const onSelectChange = useCallback(
    (selected: { token: TokenDetails }, { action }: ActionMeta): void => {
      // When an option is chosen, give control back to react-select
      setIsFocused(false)

      if (selected && action === 'select-option' && 'token' in selected) {
        onChange(selected.token)
      }
    },
    [onChange],
  )

  // When the search input is focused, force menu to remain open
  const onMenuInputFocus = useCallback(() => setIsFocused(true), [])

  const [inputText, setInputText] = useSafeState('')

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }): void => {
      if (e.key === 'Escape') {
        // Close menu on `Escape`
        e.stopPropagation()
        setIsFocused(false)
      } else if (!e.target.value && e.key === ' ') {
        // Prevent a space when input in empty.
        // That closes the menu. (/shrug)
        e.preventDefault()
      } else if (e.key === 'Enter' && networkId && isAddress(e.target.value.toLowerCase())) {
        const tokenAddress = e.target.value
        if (tokenListApi.hasToken({ tokenAddress, networkId })) return

        // prevents double-catch of this event
        // double because it's captured from onKeyDown in MenuList
        // and in general on Select, I guess
        e.stopPropagation()
      }
    },
    [networkId],
  )

  const wrapperRef = useRef<HTMLDivElement>(null)
  const { modalProps, addTokensToList } = useBetterAddTokenModal()

  // mount and umount hooks for watching click events
  useEffect(() => {
    const onDocumentClick = (e: MouseEvent): void => {
      const menu = wrapperRef.current?.querySelector('.react-select__menu')
      // whenever there's a click on the page, check whether the menu is visible and click was on the wrapper
      // If neither, hand focus back to react-select but turning isFocused off
      if (!wrapperRef.current?.contains(e.target as Node) || !menu) {
        setIsFocused(false)
        setInputText('')
      }
    }

    window.addEventListener('mousedown', onDocumentClick)

    return (): void => window.removeEventListener('mousedown', onDocumentClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fallBackNetworkId = networkId || Network.Mainnet

  return (
    <Wrapper ref={wrapperRef} onKeyDown={stopEnterPropagation}>
      <StyledSelect
        blurInputOnSelect
        isSearchable
        isDisabled={isDisabled}
        styles={customSelectStyles}
        className="tokenSelectBox"
        classNamePrefix="react-select"
        noOptionsMessage={(): React.ReactNode => (
          <SearchItem
            value={inputText}
            defaultText={NO_OPTIONS_MESSAGE}
            networkId={fallBackNetworkId}
            addTokensToList={addTokensToList}
          />
        )}
        formatOptionLabel={formatOptionLabel}
        options={options}
        value={{ token: selected }}
        onChange={onSelectChange}
        tabIndex={tabIndex.toString()}
        components={components}
        isFocused={isFocused || undefined}
        menuIsOpen={isFocused || undefined} // set to `true` to make it permanently open and work with styles
        onMenuInputFocus={onMenuInputFocus}
        onKeyDown={onKeyDown}
        onInputChange={setInputText}
        inputValue={inputText}
      />
      <div
        onMouseDown={(e): void => {
          // hack to stop modali events from interfering with TokenSelector
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        <Modali.Modal {...modalProps} />
      </div>
    </Wrapper>
  )
}

export default TokenSelector
