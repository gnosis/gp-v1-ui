import React from 'react'
import styled from 'styled-components'
import { TokenDetails } from 'types'
import { useFormContext } from 'react-hook-form'
import { TradeFormData } from '.'
// import { parseAmount, DEFAULT_PRECISION } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'

const Wrapper = styled.div`
  div {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    height: 6em;
  }

  small {
    font-size: 0.6em;
    color: gray;
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
      <label>Min sell price</label>
      <div>
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
      </div>
    </Wrapper>
  )
}

export default Price
