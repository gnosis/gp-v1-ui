import React from 'react'
import styled from 'styled-components'

import TokenImg from 'components/TokenImg'
import { TokenDetails } from 'types'
import { Link } from 'react-router-dom'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const TokenImgWrapper = styled(TokenImg)`
  margin-right: 1em;
  width: 50px;
  height: 50px;
`

const SelectBox = styled.div`
  margin: 0 1em 0 1em;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  label {
    text-transform: uppercase;
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
  }
`

const WalletDetail = styled.div`
  font-size: 0.75em;

  .success {
    color: green;
  }
`

interface Props {
  tokenDetails: TokenDetails
  selectLabel: string
}

const TokenRow: React.FC<Props> = ({ selectLabel, tokenDetails: { name, image } }: Props) => {
  const selectId = selectLabel.replace(/[^a-zA-Z]/g, '')

  return (
    <Wrapper>
      <TokenImgWrapper alt={name} src={image} />
      <SelectBox>
        <label htmlFor={selectId}>{selectLabel}</label>
        <select name="tokenSelector" id={selectId}>
          <option value="DAI">DAI</option>
        </select>
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
