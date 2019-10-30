import React, { CSSProperties, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Select from 'react-select'
import { FormatOptionLabelContext } from 'react-select/src/Select'

import TokenImg from 'components/TokenImg'
import { TokenDetails } from 'types'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const TokenImgWrapper = styled(TokenImg)`
  width: 50px;
  height: 50px;

  margin-right: 1em;
`

const SelectBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  margin: 0em 1em;

  label {
    text-transform: uppercase;
    padding-left: 8px; // to align with Select input padding
  }

  input {
    margin-left: 0; // to fix extra space on Select search box
  }
`

const InputBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-grow: 1;

  margin-left: 1em;

  input {
    margin: 0 0 0.5em 0;
    width: 100%;
  }
`

const WalletDetail = styled.div`
  font-size: 0.75em;

  .success {
    color: green;
  }
`

function renderOptionLabel(token: TokenDetails): React.ReactNode {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <TokenImgWrapper
        src={token.image}
        alt={token.name}
        style={{
          margin: '0.25em 2em 0.25em 1em',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
    <div>
      <strong>{token.symbol}</strong>
    </div>
  ) : (
    renderOptionLabel(token)
  )
}

const customSelectStyles = {
  control: (provided: CSSProperties): CSSProperties => ({ ...provided, border: 'none' }),
  menu: (provided: CSSProperties): CSSProperties => ({ ...provided, minWidth: '300px' }),
  valueContainer: (provided: CSSProperties): CSSProperties => ({ ...provided, minWidth: '4.5em' }),
}

interface Props {
  token: TokenDetails
  tokens: TokenDetails[]
  selectLabel: string
  onSelectChange: (selected: TokenDetails) => void
}

const TokenRow: React.FC<Props> = ({ token, tokens, selectLabel, onSelectChange }: Props) => {
  const options = useMemo(() => tokens.map(token => ({ token, value: token.symbol, label: token.name })), [tokens])

  return (
    <Wrapper>
      <TokenImgWrapper alt={token.name} src={token.image} />
      <SelectBox>
        <label>{selectLabel}</label>
        <Select
          isSearchable
          styles={customSelectStyles}
          noOptionsMessage={(): string => 'No results'}
          formatOptionLabel={formatOptionLabel}
          options={options}
          value={{ token }}
          onChange={(selected, { action }): void => {
            if (action === 'select-option' && 'token' in selected) {
              onSelectChange(selected.token)
            }
          }}
        />
      </SelectBox>
      <InputBox>
        <input type="text" placeholder="0" />
        <WalletDetail>
          <strong>
            <Link to="/deposit">Exchange wallet:</Link>
          </strong>{' '}
          <span className="success">312312.33</span>
        </WalletDetail>
        <WalletDetail>
          <strong>Wallet:</strong> 444.33
        </WalletDetail>
      </InputBox>
    </Wrapper>
  )
}

export default TokenRow
