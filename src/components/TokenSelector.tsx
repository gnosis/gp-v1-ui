import React, { CSSProperties, useMemo } from 'react'
import styled from 'styled-components'
import Select, { ActionMeta } from 'react-select'

import { TokenDetails } from 'types'
import TokenImg from './TokenImg'
import { FormatOptionLabelContext } from 'react-select/src/Select'

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
    align-items: center;

    > div {
      display: flex;
      flex-direction: column;
      margin-left: 1rem;
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

  > strong {
    font-weight: var(--font-weight-medium);
  }
`

function renderOptionLabel(token: TokenDetails): React.ReactNode {
  return (
    <div className="optionItem">
      <TokenImgWrapper src={token.image} alt={token.name} />
      <div>
        <div>
          <strong>{token.symbol}</strong>
        </div>
        <div>{token.name}</div>
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
  control: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    borderColor: '#B8C7D7',
    borderStyle: 'solid',
    borderWidth: '.1rem',
    margin: 'auto 0',
    borderRadius: '15rem',
    background: '#e6ecf3',
    cursor: 'pointer',
    // '&:hover': {
    //   opacity: '1',
    //   borderColor: '#476481',
    // },
    // '>div': {
    //   padding: '0 0 0 1rem',
    //   overflow: 'visible',
    // },
  }),
  menu: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    height: '50vh',
    minHeight: '30rem',
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
    zIndex: 200,
    boxShadow: '0 999vh 0 999vw rgba(47, 62, 78, 0.50)',
    borderRadius: '0.6rem',
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
    '&:hover': {
      background: 'var(--color-background)',
    },
  }),
  valueContainer: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    minWidth: '4.5rem',
  }),
  indicatorSeparator: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    display: 'none',
  }),
  dropdownIndicator: (provided: CSSProperties): CSSProperties => ({
    ...provided,
    color: '#476481',
    opacity: '1',
    //TODO: `hover` is not supported by default, we need a custom solution/CSS https://stackoverflow.com/questions/28365233/inline-css-styles-in-react-how-to-implement-ahover
    // '&:hover': {
    //   opacity: '1',
    //   color: '#476481',
    // },
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

interface Props {
  label?: string
  isDisabled?: boolean
  tokens: TokenDetails[]
  selected: TokenDetails
  onChange: (selected: TokenDetails) => void
  tabIndex?: number
}

const TokenSelector: React.FC<Props> = ({ isDisabled, tokens, selected, onChange, tabIndex = 0 }) => {
  const options = useMemo(() => tokens.map(token => ({ token, value: token.symbol, label: token.name })), [tokens])

  return (
    <Wrapper>
      <StyledSelect
        isSearchable
        isDisabled={isDisabled}
        styles={customSelectStyles}
        className="tokenSelectBox"
        noOptionsMessage={(): string => 'No results'}
        formatOptionLabel={formatOptionLabel}
        options={options}
        value={{ token: selected }}
        onChange={(selected: { token: TokenDetails }, { action }: ActionMeta): void => {
          if (selected && action === 'select-option' && 'token' in selected) {
            onChange(selected.token)
          }
        }}
        tabIndex={tabIndex.toString()}
      />
    </Wrapper>
  )
}

export default TokenSelector
