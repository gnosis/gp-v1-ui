import React from 'react'
import styled from 'styled-components'
import { TokenDetails } from 'types'
import { useFormContext } from 'react-hook-form'
import { TradeFormData } from '.'
import BigNumber from 'bignumber.js'
import { parseBigNumber, validatePositive, validInputPattern } from 'utils'
import FormMessage from './FormMessage'
import { useNumberInput } from './useNumberInput'
import { DEFAULT_PRECISION } from '../../../test/data'

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

const Price: React.FC<Props> = ({ sellToken, receiveToken, priceInputId, priceInverseInputId }) => {
  const { register, errors, setValue, watch } = useFormContext<TradeFormData>()
  // const priceInput = watch(priceInputId)
  // const priceInverseInput = watch(priceInverseInputId)

  const errorPrice = errors[priceInputId]
  const errorPriceInverse = errors[priceInverseInputId]
  const isError = errorPrice || errorPriceInverse

  const onChangePrice = (inverseInputId: string, event: React.ChangeEvent<HTMLInputElement>): void => {
    const priceValue = event.target.value
    const price = parseBigNumber(priceValue)
    setValue(inverseInputId, price ? new BigNumber(1).div(price).toString() : '')
  }

  const {
    onKeyPress: onKeyPressPrice,
    enforcePrecision: enforcePrecisionPrice,
    removeExcessZeros: removeExcessZerosPrice,
  } = useNumberInput({
    inputId: priceInputId,
    precision: DEFAULT_PRECISION,
  })
  const {
    onKeyPress: onKeyPressPriceInverse,
    enforcePrecision: enforcePrecisionPriceInverse,
    removeExcessZeros: removeExcessZerosPriceInverse,
  } = useNumberInput({
    inputId: priceInputId,
    precision: DEFAULT_PRECISION,
  })

  return (
    <Wrapper>
      <strong>Min. sell price</strong>
      <PriceInputBox>
        <label>
          <input
            className={isError ? 'error' : ''}
            name={priceInputId}
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              enforcePrecisionPrice()
              onChangePrice(priceInverseInputId, e)
            }}
            ref={register({
              pattern: { value: validInputPattern, message: 'Invalid price' },
              validate: { positive: validatePositive },
              required: 'The price is required',
              min: 0,
            })}
            onKeyPress={onKeyPressPrice}
            onBlur={removeExcessZerosPrice}
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
            className={isError ? 'error' : ''}
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              enforcePrecisionPriceInverse()
              onChangePrice(priceInputId, e)
            }}
            ref={register({
              pattern: { value: validInputPattern, message: 'Invalid price' },
              validate: { positive: validatePositive },
              required: true,
            })}
            onKeyPress={onKeyPressPriceInverse}
            onBlur={removeExcessZerosPriceInverse}
          ></input>
          <small>
            {receiveToken.symbol}/{sellToken.symbol}
          </small>
        </label>
      </PriceInputBox>
      {errorPrice && <FormMessage className="error">{errorPrice.message}</FormMessage>}
      {errorPriceInverse && <FormMessage className="error">{errorPriceInverse.message}</FormMessage>}
    </Wrapper>
  )
}

export default Price
