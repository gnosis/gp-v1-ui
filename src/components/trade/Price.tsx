import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'
import { invertPrice } from '@gnosis.pm/dex-js'

// types, utils
import { TokenDetails } from 'types'
import { parseBigNumber } from 'utils'
import { DEFAULT_PRECISION, MEDIA } from 'const'

// Components
import { OrderBookBtn } from 'components/OrderBookBtn'

// Common
import { FormInputError } from 'components/common/FormInputError'
import { FormMessage } from 'components/common/FormMessage'

// TradeWidget: subcomponents
import { TradeFormData } from 'components/TradeWidget'
import { useNumberInput } from 'components/TradeWidget/useNumberInput'
import { SwapPrice } from 'components/common/SwapPrice'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  margin: 1.6rem 0 0;
  justify-content: space-between;

  > strong {
    display: flex;
    align-items: center;
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

    > ${FormMessage} {
      width: min-content;
      white-space: nowrap;
      font-size: x-small;
      margin: 0 0.5rem;
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

const PriceInputBox = styled.div<{ hidden?: boolean }>`
  display: ${(props): string => (props.hidden ? 'none' : 'flex')};
  flex-flow: column nowrap;
  margin: 0;
  width: 100%;
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

  label > div:not(.radio-container) {
    position: absolute;
    right: 1rem;
    top: 0;
    bottom: 0;
    margin: auto;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-evenly;
    opacity: 0.75;
    font-size: 1.1rem;
    color: var(--color-text-primary);
    letter-spacing: -0.05rem;
    text-align: right;
    font-weight: var(--font-weight-bold);

    @media ${MEDIA.mobile} {
      font-size: 1rem;
      letter-spacing: 0.03rem;
    }
    > small:nth-child(2) {
      margin: 0 0.3rem;
      font-size: 1rem;
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
    padding: 0 15ch 0 1rem;
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

export interface Props {
  quoteToken: TokenDetails
  baseToken: TokenDetails
  priceInputId: string
  priceInverseInputId: string
  tabIndex?: number
  onSwapPrices: () => void
  priceShown: 'INVERSE' | 'DIRECT'
}

export function invertPriceFromString(priceValue: string): string {
  const price = parseBigNumber(priceValue)
  if (!price) {
    return ''
  }
  const invertedPrice = invertPrice(price)
  // To avoid `Infinity` on price inputs
  return invertedPrice.isFinite() ? invertedPrice.toString(10) : '0'
}

export const Price: React.FC<Props> = ({
  quoteToken,
  baseToken,
  priceInputId,
  priceInverseInputId,
  tabIndex,
  onSwapPrices,
  priceShown,
}) => {
  const { register, errors, setValue } = useFormContext<TradeFormData>()

  const errorPrice = errors[priceInputId]
  const errorPriceInverse = errors[priceInverseInputId]
  const isError = errorPrice || errorPriceInverse

  const updateTheOtherPrice = useCallback(
    (theOtherInputId: string, event: React.ChangeEvent<HTMLInputElement>): void => {
      const priceValue = event.target.value
      const priceInverseValue = invertPriceFromString(priceValue)
      setValue(theOtherInputId, priceInverseValue, { shouldValidate: true })
    },
    [setValue],
  )

  const onChangePrice = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      // Update
      updateTheOtherPrice(priceInverseInputId, e)
    },
    [updateTheOtherPrice, priceInverseInputId],
  )

  const onChangePriceInverse = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      updateTheOtherPrice(priceInputId, e)
    },
    [updateTheOtherPrice, priceInputId],
  )

  const { onKeyPress: onKeyPressPrice, removeExcessZeros: removeExcessZerosPrice } = useNumberInput({
    inputId: priceInputId,
    precision: DEFAULT_PRECISION,
  })
  const { onKeyPress: onKeyPressPriceInverse, removeExcessZeros: removeExcessZerosPriceInverse } = useNumberInput({
    inputId: priceInverseInputId,
    precision: DEFAULT_PRECISION,
  })
  const isDirect = priceShown === 'DIRECT'

  return (
    <Wrapper>
      <strong>
        Limit Price <OrderBookBtn baseToken={baseToken} quoteToken={quoteToken} />
      </strong>
      {/* using display: none to hide to avoid hook-form reregister */}
      <PriceInputBox hidden={!isDirect}>
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
          <SwapPrice
            baseToken={baseToken}
            quoteToken={quoteToken}
            isPriceInverted={false}
            onSwapPrices={onSwapPrices}
          />
        </label>
        <FormInputError errorMessage={errorPrice?.message} />
      </PriceInputBox>
      <PriceInputBox hidden={isDirect}>
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
          <SwapPrice baseToken={baseToken} quoteToken={quoteToken} isPriceInverted={true} onSwapPrices={onSwapPrices} />
        </label>
        <FormInputError errorMessage={errorPriceInverse?.message} />
      </PriceInputBox>
      {/*  MAX SLIPPAGE CONTROL */}
    </Wrapper>
  )
}

export default Price
