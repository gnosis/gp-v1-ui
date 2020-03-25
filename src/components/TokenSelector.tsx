import React, { CSSProperties, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import styled from 'styled-components'
import Select, { ActionMeta } from 'react-select'
import { MEDIA } from 'const'

import { formatAmount } from '@gnosis.pm/dex-js'

import { TokenDetails, TokenBalanceDetails } from 'types'
import TokenImg from './TokenImg'
import { FormatOptionLabelContext } from 'react-select/src/Select'
import { MenuList } from './TokenSelectorComponents'
import searchIcon from 'assets/img/search.svg'

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

  .optionItem {
    display: flex;
    width: 100%;
    align-items: center;

    img {
      width: 3.6rem;
      height: 3.6rem;
      object-fit: contain;
      margin: 0;
    }

    .tokenDetails {
      display: flex;
      justify-content: space-between;
      width: inherit;

      .tokenName {
        display: flex;
        flex-direction: column;
        margin-left: 1rem;
      }

      .tokenBalance {
        font-weight: bold;
        align-self: center;
      }
    }

    > div > div {
      font-weight: var(--font-weight-normal);
      font-size: 1.3rem;
      color: #476481;
      line-height: 1.1;
    }

    > div > div > strong {
      font-weight: var(--font-weight-bold);
      margin: 0;
      font-size: 1.6rem;
    }
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
          background: #e7ecf3 url(${searchIcon}) no-repeat left 1.6rem center/1.6rem;
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

const TokenImgWrapper = styled(TokenImg)`
  width: 2.4rem;
  height: 2.4rem;
  margin: 0 0.5rem 0 0;
`

const StyledSelect = styled(Select)`
  display: flex;
  align-items: center;
`

const SelectedTokenWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  color: #476481;
  letter-spacing: -0.05rem;
  text-align: right;
`

function renderOptionLabel(token: TokenDetails | TokenBalanceDetails): React.ReactNode {
  return (
    <div className="optionItem">
      <TokenImgWrapper src={token.image} alt={token.name} />
      <div className="tokenDetails">
        <div className="tokenName">
          <div>
            <strong>{token.symbol}</strong>
          </div>
          <div>{token.name}</div>
        </div>
        {'totalExchangeBalance' in token && (
          <div className="tokenBalance">{formatAmount(token.totalExchangeBalance, token.decimals)}</div>
        )}
      </div>
    </div>
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
    borderColor: '#B8C7D7',
    borderStyle: 'solid',
    borderWidth: '.1rem',
    margin: 'auto 0',
    borderRadius: '15rem',
    background: '#e6ecf3',
    cursor: 'pointer',
    display: 'flex',
    flexFlow: 'row nowrap',
    '&:hover': {
      opacity: '1',
      borderColor: '#476481',
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
    zIndex: 9999,
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
    borderBottom: '0.1rem solid #dfe6ef',
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
    color: '#476481',
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

const noOptionsMessage = (): string => 'No results'

interface Props {
  label?: string
  isDisabled?: boolean
  tokens: TokenDetails[]
  selected: TokenDetails
  onChange: (selected: TokenDetails) => void
  tabIndex?: number
}

const TokenSelector: React.FC<Props> = ({ isDisabled, tokens, selected, onChange, tabIndex = 0 }) => {
  const options = useMemo(
    () => tokens.map(token => ({ token, value: `${token.symbol} ${token.address}`, label: token.name })),
    [tokens],
  )

  // isFocused is used to force the menu to remain open and give focus to the search input
  const [isFocused, setIsFocused] = useState(false)

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

  const onKeyDown = useCallback((e): void => {
    if (e.key === 'Escape') {
      // Close menu on `Escape`
      e.stopPropagation()
      setIsFocused(false)
    } else if (!e.target.value && e.key === ' ') {
      // Prevent a space when input in empty.
      // That closes the menu. (/shrug)
      e.preventDefault()
    }
  }, [])

  const wrapperRef = useRef<HTMLDivElement>(null)

  const onDocumentClick = useCallback(e => {
    const menu = wrapperRef.current?.querySelector('.react-select__menu')
    // whenever there's a click on the page, check whether the menu is visible and click was on the wrapper
    // If neither, hand focus back to react-select but turning isFocused off
    if (!wrapperRef.current?.contains(e.target) || !menu) {
      setIsFocused(false)
    }
  }, [])

  // mount and umount hooks for watching click events
  useEffect(() => {
    window.addEventListener('mousedown', onDocumentClick)

    return (): void => window.removeEventListener('mousedown', onDocumentClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Wrapper ref={wrapperRef}>
      <StyledSelect
        blurInputOnSelect
        isSearchable
        isDisabled={isDisabled}
        styles={customSelectStyles}
        className="tokenSelectBox"
        classNamePrefix="react-select"
        noOptionsMessage={noOptionsMessage}
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
      />
    </Wrapper>
  )
}

export default TokenSelector
