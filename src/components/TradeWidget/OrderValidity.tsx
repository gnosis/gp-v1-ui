import React, { useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'
import { adjustPrecision, ZERO } from '@gnosis.pm/dex-js'

import { TradeFormTokenId, TradeFormData } from './'
import { PriceInputBox } from './Price'

import useSafeState from 'hooks/useSafeState'
import { validInputPattern, formatTimeInHours, makeMultipleOf } from 'utils'

import cog from 'assets/img/cog.svg'

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  flex-flow: row wrap;
  border-bottom: 0.1rem solid #dfe6ef;

  > input {
    width: 100%;
  }

  .radio-container {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-content: center;

    > small {
      margin: auto 0.5rem;
    }
  }

  > button {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    font-weight: var(--font-weight-normal);
    font-size: 1.4rem;
    color: #476481;
    letter-spacing: -0.03rem;
    height: 5.6rem;
    position: relative;
    outline: 0;
    background: transparent;
    align-items: center;
    flex-flow: row wrap;

    &:hover {
      background: transparent;
    }

    &::after {
      content: '';
      background: url(${cog}) no-repeat center/contain;
      width: 1.3rem;
      height: 1.3rem;
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      opacity: 0.5;
      transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
    }

    &:hover::after {
      opacity: 1;
      transform: rotate(90deg);
    }
  }

  > button > b {
    color: #218dff;
    margin: 0 0.4rem;
  }
`

const OrderValidityInputsWrapper = styled.div<{ $visible: boolean }>`
  visibility: ${({ $visible }): string => ($visible ? 'visible' : 'hidden')};
  position: fixed;

  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background: var(--color-background-pageWrapper);
  color: var(--color-text-primary);
  z-index: 500;
  box-shadow: 0 999vh 0 999vw rgba(47, 62, 78, 0.5);

  max-width: 50rem;
  min-width: 30rem;
  height: 18rem;
  padding: 2.7rem;
  border-radius: 0.8rem;

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: space-between;

  transition: all 0.5s ease-in-out;
  > strong {
    text-transform: capitalize;
    color: #2f3e4e;
    width: 100%;
    margin: 0 0 1rem;
    padding: 0 1rem;
    box-sizing: border-box;
  }
  > button {
    background: #218dff;
    border-radius: 3rem;
    padding: 0.8rem 2rem;
    color: white;
    margin: auto;
  }
`

const OrderValidityBox = styled(PriceInputBox)`
  flex-flow: column nowrap;
  height: 7rem;

  strong {
    margin-bottom: 1rem;
  }

  label {
    height: 100%;
  }

  input[type='checkbox'] {
    margin: auto;
  }
`

interface Props {
  validFromInputId: TradeFormTokenId
  validUntilInputId: TradeFormTokenId
  isDisabled: boolean
  isAsap: boolean
  tabIndex: number
  isUnlimited: boolean
  setAsap: Dispatch<SetStateAction<boolean>>
  setUnlimited: Dispatch<SetStateAction<boolean>>
}

const OrderValidity: React.FC<Props> = ({
  isDisabled,
  isUnlimited,
  setAsap,
  setUnlimited,
  isAsap,
  tabIndex,
  validFromInputId,
  validUntilInputId,
}) => {
  const [showOrderConfig, setShowOrderConfig] = useSafeState(false)
  const { setValue, errors, register, getValues, watch } = useFormContext<TradeFormData>()
  const { validFrom, validUntil } = getValues()

  const validFromError = errors[validFromInputId]
  const validUntilError = errors[validUntilInputId]
  const validFromInputValue = watch(validFromInputId)
  const validUntilInputValue = watch(validUntilInputId)
  const overMax = ZERO
  const validFromClassName = validFromError ? 'error' : overMax.gt(ZERO) ? 'warning' : ''
  const validUntilClassName = validUntilError ? 'error' : overMax.gt(ZERO) ? 'warning' : ''

  const handleShowConfig = useCallback((): void => {
    if (showOrderConfig) {
      // sanitize inputs as multiples of 5
      const sanitizedFromValue = makeMultipleOf(5, validFromInputValue).toString()
      const sanitizedUntilValue = makeMultipleOf(5, validUntilInputValue).toString()

      batchedUpdates(() => {
        setValue(validFromInputId, sanitizedFromValue, true)
        setValue(validUntilInputId, sanitizedUntilValue, true)
      })
    }

    setShowOrderConfig(showOrderConfig => !showOrderConfig)
  }, [
    setShowOrderConfig,
    setValue,
    showOrderConfig,
    validFromInputId,
    validFromInputValue,
    validUntilInputId,
    validUntilInputValue,
  ])

  const handleValidFromChange = useCallback(() => {
    const newValue = adjustPrecision(validFromInputValue, 0)
    if (validFromInputValue !== newValue) {
      setValue(validFromInputId, newValue, true)
    }
  }, [validFromInputValue, setValue, validFromInputId])

  const handleValidUntilChange = useCallback(() => {
    const newValue = adjustPrecision(validUntilInputValue, 0)
    if (validUntilInputValue !== newValue) {
      setValue(validUntilInputId, newValue, true)
    }
  }, [validUntilInputValue, setValue, validUntilInputId])

  useEffect(() => {
    handleValidFromChange()
  }, [handleValidFromChange])

  useEffect(() => {
    handleValidUntilChange()
  }, [handleValidUntilChange])

  function handleUnlimitedClick(): void {
    setUnlimited(isUnlimited => !isUnlimited)
    !isUnlimited ? setValue(validUntilInputId, '', true) : setValue(validUntilInputId, '30', true)
  }
  function handleASAPClick(): void {
    setAsap(isAsap => !isAsap)
    !isAsap ? setValue(validFromInputId, '', true) : setValue(validFromInputId, '30', true)
  }

  return (
    <Wrapper>
      <button type="button" onClick={handleShowConfig}>
        Order starts: <b>{formatTimeInHours(validFrom, 'ASAP')}</b> - expires:{' '}
        <b>{formatTimeInHours(validUntil, 'Never')}</b>
      </button>

      <OrderValidityInputsWrapper $visible={showOrderConfig}>
        <OrderValidityBox>
          <strong>Order starts in (min)</strong>
          <label>
            <input
              className={validFromClassName}
              name={validFromInputId}
              type="number"
              step="5"
              disabled={isDisabled || isAsap}
              required
              ref={register({
                pattern: {
                  value: validInputPattern,
                  message: 'Order from time cannot be negative or less than 15 minutes',
                },
                validate: value => Number(value) === 0 || Number(value) >= 15,
              })}
              onChange={handleValidFromChange}
              onFocus={(e): void => e.target.select()}
              tabIndex={tabIndex + 2}
            />
            <div className="radio-container">
              <input type="checkbox" disabled={isDisabled} defaultChecked={isAsap} onClick={handleASAPClick} />
              <small>ASAP</small>
            </div>
          </label>
        </OrderValidityBox>
        <OrderValidityBox>
          <strong>Order expires in (min)</strong>
          <label>
            <input
              className={validUntilClassName}
              name={validUntilInputId}
              type="number"
              step="5"
              disabled={isDisabled || isUnlimited}
              required
              ref={register({
                pattern: { value: validInputPattern, message: 'Expiration time cannot be negative' },
                validate: value => Number(value) === 0 || Number(value) >= 5,
              })}
              onChange={handleValidUntilChange}
              onFocus={(e): void => e.target.select()}
              tabIndex={tabIndex + 3}
            />
            <div className="radio-container">
              <input
                type="checkbox"
                disabled={isDisabled}
                defaultChecked={isUnlimited}
                onClick={handleUnlimitedClick}
              />
              <small>Never</small>
            </div>
          </label>
        </OrderValidityBox>
        <button type="button" onClick={handleShowConfig}>
          Set order parameters
        </button>
      </OrderValidityInputsWrapper>
    </Wrapper>
  )
}

export default OrderValidity
