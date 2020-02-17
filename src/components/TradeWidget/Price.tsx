import React from 'react'
import styled from 'styled-components'
import { TokenDetails } from 'types'
import { useFormContext } from 'react-hook-form'
import { TradeFormData } from '.'
// import { parseAmount, DEFAULT_PRECISION } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  margin: 2.4rem 0 0;
  justify-content: space-between;

  > strong {
    text-transform: capitalize;
    color: #2f3e4e;
    width: 100%;
    margin: 0 0 1rem;
    padding: 0 1rem;
    box-sizing: border-box;
  }
`

const PriceInputBox = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0;
  width: 50%;
  width: calc(50% - 0.8rem);
  height: 5.6rem;
  position: relative;

  label {
    display: flex;
    width: auto;
    max-width: 100%;
    position: relative;
  }

  label > small {
    position: absolute;
    right: 1rem;
    top: 0;
    bottom: 0;
    margin: auto;
    display: flex;
    align-items: center;
    opacity: 0.75;
    font-size: 1.2rem;
    color: #476481;
    letter-spacing: -0.05rem;
    text-align: right;
    font-weight: var(--font-weight-medium);
  }

  input {
    margin: 0;
    width: auto;
    max-width: 100%;
    background: #e7ecf3;
    border-radius: 0.6rem 0.6rem 0 0;
    border: 0;
    font-size: 1.6rem;
    line-height: 1;
    box-sizing: border-box;
    border-bottom: 0.2rem solid transparent;
    font-weight: var(--font-weight-normal);
    padding: 0 7rem 0 1rem;

    &:focus {
      border-bottom: 0.2rem solid #218dff;
      border-color: #218dff;
      color: #218dff;
    }

    &.error {
      border-color: #ff0000a3;
    }

    &.warning {
      border-color: orange;
    }

    &:disabled {
      box-shadow: none;
    }
  }
`

interface Props {
  sellToken: TokenDetails
  receiveToken: TokenDetails
  priceInputId: string
  priceInverseInputId: string
}

// TODO: Move to utils
export function parseBigNumber(value: string): BigNumber | null {
  const bigNumber = new BigNumber(value)
  return bigNumber.isNaN() ? null : bigNumber
}

const Price: React.FC<Props> = ({ sellToken, receiveToken, priceInputId, priceInverseInputId }) => {
  const { register, errors, setValue } = useFormContext<TradeFormData>()
  // const priceInput = watch(priceInputId)
  // const priceInverseInput = watch(priceInverseInputId)

  const errorPrice = errors[priceInputId]
  const errorPriceInverse = errors[priceInverseInputId]

  // TODO: Show error
  if (errorPrice || errorPriceInverse) {
    console.log('TODO: Show error', { errorPrice, errorPriceInverse })
  }

  const onChangePrice = (inverseInputId: string, event: React.ChangeEvent<HTMLInputElement>): void => {
    const priceValue = event.target.value
    const price = parseBigNumber(priceValue)
    console.log('price: ', priceValue, price)
    setValue(inverseInputId, price ? new BigNumber(1).div(price).toString() : '')
  }

  return (
    <Wrapper>
      <strong>Min. sell price</strong>
      <PriceInputBox>
        <label>
          <input
            name={priceInputId}
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChangePrice(priceInverseInputId, e)}
            ref={register({
              // pattern: { value: validInputPattern, message: 'Invalid amount' },
              // validate: { positive: validatePositive },
              required: true,
            })}
          ></input>
          <small>
            {sellToken.symbol}/{receiveToken.symbol}
          </small>
        </label>
      </PriceInputBox>
      <PriceInputBox>
        <label>
          <input
            name={priceInverseInputId}
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChangePrice(priceInputId, e)}
            ref={register({
              // pattern: { value: validInputPattern, message: 'Invalid amount' },
              // validate: { positive: validatePositive },
              required: true,
            })}
          ></input>
          <small>
            {receiveToken.symbol}/{sellToken.symbol}
          </small>
        </label>
      </PriceInputBox>
    </Wrapper>
  )
}

export default Price
