import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'
import { invertPrice } from '@gnosis.pm/dex-js'

import { TokenDetails } from 'types'
import { parseBigNumber } from 'utils'
import { DEFAULT_PRECISION, MEDIA } from 'const'

import { TradeFormData } from '.'
import { FormInputError } from './FormMessage'
import { useNumberInput } from './useNumberInput'
import { OrderBookBtn } from 'components/OrderBookBtn'
import { HelpTooltip } from 'components/Tooltip'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  margin: 1.6rem 0 0;
  justify-content: space-between;

  > strong {
    display: flex;
    text-transform: capitalize;
    color: var(--color-text-primary);
    width: 100%;
    margin: 0 0 1rem;
    padding: 0;
    box-sizing: border-box;
    font-size: 1.5rem;
    @media ${MEDIA.mobile} {
      font-size: 1.3rem;
    }

    > button {
      background: none;
      border: 0;
      outline: 0;
      color: var(--color-text-active);
    }

    > button:hover {
      text-decoration: underline;
    }
  }
`

export const PriceInputBox = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 0;
  width: 50%;
  width: calc(50% - 0.8rem);
  position: relative;
  outline: 0;

  @media ${MEDIA.mobile} {
    width: 100%;
    margin: 0 0 1.6rem;
  }

  label {
    display: flex;
    width: auto;
    max-width: 100%;
    height: 5.6rem;
    position: relative;

    @media ${MEDIA.mobile} {
      width: 100%;
    }
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
    color: var(--color-text-primary);
    letter-spacing: -0.05rem;
    text-align: right;
    font-weight: var(--font-weight-bold);

    @media ${MEDIA.mobile} {
      font-size: 1rem;
      letter-spacing: 0.03rem;
    }
  }

  input:not([type='checkbox']) {
    margin: 0;
    width: 100%;
    max-width: 100%;
    background: var(--color-background-input);
    border-radius: 0.6rem 0.6rem 0 0;
    border: 0;
    font-size: 1.6rem;
    line-height: 1;
    box-sizing: border-box;
    border-bottom: 0.2rem solid transparent;
    font-weight: var(--font-weight-normal);
    padding: 0 8.5rem 0 1rem;
    outline: 0;

    @media ${MEDIA.mobile} {
      font-size: 1.3rem;
      width: 100%;
    }

    &:focus {
      border-bottom: 0.2rem solid var(--color-text-active);
      border-color: var(--color-text-active);
      color: var(--color-text-active);
    }

    &:focus::placeholder {
      color: transparent;
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
`

interface Props {
  sellToken: TokenDetails
  receiveToken: TokenDetails
  priceInputId: string
  priceInverseInputId: string
  tabIndex?: number
}

const MaximumSlippageWrapper = styled.div`
  background: var(--color-background-input);
  padding: 1rem;
  width: 100%;

  > div {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: space-evenly;

    margin: 1rem auto;
    width: 100%;

    > button,
    > label > input[type='text'] {
      flex: 1;

      background: var(--color-background-pageWrapper);
      color: var(--color-text-primary);
      font-size: 1.15rem;
      font-weight: normal;

      border-radius: 3rem;
      height: 3.6rem;

      padding: 1rem;
      &:not(:last-child) {
        margin-right: 1rem;
      }

      white-space: nowrap;

      &.selected,
      &:hover:not(input),
      &:focus,
      &:focus ~ small {
        color: var(--color-background-pageWrapper);
      }

      &.selected,
      &:hover:not(input),
      &:focus {
        background: var(--color-background-CTA);
      }

      transition: background 0.2s ease-in-out;
    }

    > label {
      position: relative;
      flex: 2;

      > small {
        position: absolute;
        right: 2rem;
        top: 0;
        bottom: 0;
        margin: auto;

        display: flex;
        align-items: center;

        opacity: 0.75;
        color: var(--color-text-primary);

        letter-spacing: -0.05rem;
        text-align: right;
        font-weight: var(--font-weight-bold);

        @media ${MEDIA.mobile} {
          font-size: 1rem;
          letter-spacing: 0.03rem;
        }
      }

      > input[type='text'] {
        margin: 0;
        padding: 1rem;
        width: 100%;
      }
    }
  }
`

interface SlippageParam {
  value: number
  suggested?: boolean
}

interface MaximumSlippageProps {
  availableSlippage?: SlippageParam[]
  suggested?: number
}

const DEFAULT_AVAILABLE_SLIPPAGE = [{ value: 0.1 }, { value: 0.5, suggested: true }, { value: 1 }]

const MaximumSlippage: React.FC<MaximumSlippageProps> = ({ availableSlippage = DEFAULT_AVAILABLE_SLIPPAGE }) => {
  return (
    <MaximumSlippageWrapper>
      <small>Limit additional price slippage</small>{' '}
      <HelpTooltip iconSize="xs" tooltip={'Set additional slippage parameters'} />
      <div>
        {availableSlippage.map(({ value, suggested }, index) => (
          <button key={value + index} type="button" onClick={(): void => alert(`Slippage Value:: ${value}`)}>
            <small>
              {value}%{suggested && ' (suggested)'}
            </small>
          </button>
        ))}
        <label>
          <input type="text" placeholder="Custom" />
          <small>%</small>
        </label>
      </div>
    </MaximumSlippageWrapper>
  )
}

export function invertPriceFromString(priceValue: string): string {
  const price = parseBigNumber(priceValue)
  return price ? invertPrice(price).toString(10) : ''
}

const Price: React.FC<Props> = ({ sellToken, receiveToken, priceInputId, priceInverseInputId, tabIndex }) => {
  const { register, errors, setValue } = useFormContext<TradeFormData>()

  const errorPrice = errors[priceInputId]
  const errorPriceInverse = errors[priceInverseInputId]
  const isError = errorPrice || errorPriceInverse

  const updateInversePrice = useCallback(
    (inverseInputId: string, event: React.ChangeEvent<HTMLInputElement>): void => {
      const priceValue = event.target.value
      const priceInverseValue = invertPriceFromString(priceValue)
      setValue(inverseInputId, priceInverseValue, true)
    },
    [setValue],
  )

  const onChangePrice = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      updateInversePrice(priceInverseInputId, e)
    },
    [updateInversePrice, priceInverseInputId],
  )

  const onChangePriceInverse = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      updateInversePrice(priceInputId, e)
    },
    [updateInversePrice, priceInputId],
  )

  const { onKeyPress: onKeyPressPrice, removeExcessZeros: removeExcessZerosPrice } = useNumberInput({
    inputId: priceInputId,
    precision: DEFAULT_PRECISION,
  })
  const { onKeyPress: onKeyPressPriceInverse, removeExcessZeros: removeExcessZerosPriceInverse } = useNumberInput({
    inputId: priceInputId,
    precision: DEFAULT_PRECISION,
  })

  return (
    <Wrapper>
      <strong>
        Limit Price <OrderBookBtn baseToken={sellToken} quoteToken={receiveToken} />
      </strong>
      <PriceInputBox>
        <label>
          <input
            className={isError ? 'error' : ''}
            name={priceInputId}
            type="text"
            onChange={onChangePrice}
            ref={register}
            onKeyPress={onKeyPressPrice}
            onBlur={removeExcessZerosPrice}
            onFocus={(e): void => e.target.select()}
            tabIndex={tabIndex}
          />
          <small>
            {sellToken.symbol}/{receiveToken.symbol}
          </small>
        </label>
        <FormInputError errorMessage={errorPrice?.message} />
      </PriceInputBox>
      <PriceInputBox>
        <label>
          <input
            name={priceInverseInputId}
            className={isError ? 'error' : ''}
            type="text"
            ref={register}
            onChange={onChangePriceInverse}
            onKeyPress={onKeyPressPriceInverse}
            onBlur={removeExcessZerosPriceInverse}
            onFocus={(e): void => e.target.select()}
            tabIndex={tabIndex}
          />
          <small>
            {receiveToken.symbol}/{sellToken.symbol}
          </small>
        </label>
        <FormInputError errorMessage={errorPriceInverse?.message} />
      </PriceInputBox>
      <MaximumSlippage />
    </Wrapper>
  )
}

export default Price
