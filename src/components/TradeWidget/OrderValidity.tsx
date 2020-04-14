/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, Dispatch, SetStateAction, useRef, useEffect } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'
import { ZERO } from '@gnosis.pm/dex-js'

import { TradeFormTokenId, TradeFormData } from './'
import { PriceInputBox } from './Price'

import useSafeState from 'hooks/useSafeState'
import { formatTimeInHours, makeMultipleOf } from 'utils'

import cog from 'assets/img/cog.svg'
import { MEDIA, VALID_UNTIL_DEFAULT, VALID_FROM_DEFAULT } from 'const'
import { HelpTooltipContainer, HelpTooltip } from 'components/Tooltip'
import { FormInputError } from './FormMessage'

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  flex-flow: row wrap;
  border-bottom: 0.1rem solid var(--color-background-banner);

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

  > div:first-child {
    width: 100%;
    display: flex;
    align-items: center;

    > div {
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
      padding: 0 0.8rem;

      > b {
        color: #218dff;
        margin: 0 0.4rem;
      }
    }
    > button {
      content: '';
      background: url(${cog}) no-repeat center/contain;
      width: 1.8rem;
      height: 1.8rem;
      margin-left: auto;
      opacity: 0.5;
      transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;

      &:hover {
        opacity: 1;
        transform: rotate(90deg);
      }
    }
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
  z-index: 3;
  box-shadow: 0 100vh 0 999vw rgba(47, 62, 78, 0.5);
  max-width: 50rem;
  min-width: 30rem;
  height: 30rem;
  padding: 0 0 2.4rem;
  border-radius: 0.8rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: flex-start;
  align-content: flex-start;
  transition: all 0.2s ease-in-out;

  @media ${MEDIA.mobile} {
    height: 40rem;
  }

  > h4 {
    height: 5.6rem;
    padding: 0 1.6rem;
    box-sizing: border-box;
    letter-spacing: 0;
    font-size: 1.6rem;
    text-align: left;
    color: var(--color-text-primary);
    margin: 0 0 2.4rem;
    display: flex;
    align-items: center;
    font-family: var(--font-default);
    font-weight: var(--font-weight-regular);
    border-bottom: 0.1rem solid var(--color-background-banner);
    width: 100%;
  }

  > h4 > i {
    cursor: pointer;
    text-decoration: none;
    font-size: 4rem;
    line-height: 1;
    color: #526877;
    opacity: 0.5;
    margin: 0 0 0 auto;
    font-style: normal;
    font-family: var(--font-mono);
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  label > input:not([type='checkbox']) {
    padding: 0 6.5rem 0 1rem;
  }

  ${PriceInputBox} {
    padding: 0 0.8rem;

    @media ${MEDIA.mobile} {
      padding: 0 1.6rem;
    }

    > strong {
      text-transform: capitalize;
      color: var(--color-text-primary);
      font-size: 1.5rem;
      width: 100%;
      margin: 0 0 1rem;
      padding: 0;
      box-sizing: border-box;
    }
  }

  > span {
    margin: auto;
    height: 5.6rem;
    border-top: 0.1rem solid var(--color-background-banner);
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0 1.6rem;
    box-sizing: border-box;
  }

  > span > button {
    border-radius: 0.6rem;
    min-width: 14rem;
    padding: 0 1.6rem;
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    font-size: 1.4rem;
    margin: 0 auto;
    outline: 0;
    height: 3.6rem;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    letter-spacing: 0.03rem;
  }
`

const OrderValidityBox = styled(PriceInputBox)`
  flex-flow: column nowrap;

  strong {
    margin-bottom: 1rem;
  }

  label {
    height: 7rem;
  }

  input[type='checkbox'] {
    margin: auto;
  }
`

const OrderStartsTooltip = (
  <HelpTooltipContainer>Orders that are valid ASAP will be considered for the next batch.</HelpTooltipContainer>
)

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
      const sanitizedFromValue = validFromInputValue ? makeMultipleOf(5, validFromInputValue).toString() : undefined
      const sanitizedUntilValue = validUntilInputValue ? makeMultipleOf(5, validUntilInputValue).toString() : undefined

      batchedUpdates(() => {
        if (!sanitizedFromValue) setAsap(true)
        if (!sanitizedUntilValue) setUnlimited(true)
        setValue(validFromInputId, sanitizedFromValue, true)
        setValue(validUntilInputId, sanitizedUntilValue, true)
      })
    }

    setShowOrderConfig(showOrderConfig => !showOrderConfig)
  }, [
    setAsap,
    setShowOrderConfig,
    setUnlimited,
    setValue,
    showOrderConfig,
    validFromInputId,
    validFromInputValue,
    validUntilInputId,
    validUntilInputValue,
  ])

  const onModalEnter: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (e): void => {
      if (e.key !== 'Enter') return
      // prevents focus stealing by Sell Input
      e.preventDefault()

      // same as click on Set Order Params button
      // only works when inputs are valid
      if (!!validUntilError || !!validFromError) {
        return
      }

      handleShowConfig()
    },
    [handleShowConfig, validFromError, validUntilError],
  )

  const validFromRef: React.MutableRefObject<HTMLInputElement | null> = useRef(null)
  const validUntilRef: React.MutableRefObject<HTMLInputElement | null> = useRef(null)

  // This side effect is for not requiring disable on validFrom/Until inputs
  // and auto-magically updating the checkbox/values on change
  // also allows auto focus and select when manually unchecking ASAP or Never checkboxes
  useEffect(() => {
    // undefined validFrom input - set ASAP
    !validFromInputValue
      ? batchedUpdates(() => {
          setAsap(true)
          setValue(validFromInputId, undefined, true)
        })
      : setAsap(false)
    // undefined validUntil input - set unlimited
    !validUntilInputValue
      ? batchedUpdates(() => {
          setUnlimited(true)
          setValue(validUntilInputId, undefined, true)
        })
      : setUnlimited(false)
  }, [setAsap, setUnlimited, setValue, validFromInputValue, validFromInputId, validUntilInputValue, validUntilInputId])

  function handleUnlimitedClick(): void {
    const reffedInput = validUntilRef.current!
    setUnlimited(isUnlimited => !isUnlimited)
    if (!isUnlimited) {
      return setValue(validUntilInputId, undefined, true)
    }

    reffedInput.focus()
    setValue(validUntilInputId, VALID_UNTIL_DEFAULT, true)
    reffedInput.select()
  }
  function handleASAPClick(): void {
    const reffedInput = validFromRef.current!
    setAsap(isAsap => !isAsap)
    if (!isAsap) {
      return setValue(validFromInputId, undefined, true)
    }
    reffedInput.focus()
    setValue(validFromInputId, VALID_FROM_DEFAULT, true)
    reffedInput.select()
  }

  return (
    <Wrapper>
      <div>
        <div>
          Order starts: <b>{formatTimeInHours(validFrom, 'ASAP')}</b>
          <HelpTooltip tooltip={OrderStartsTooltip} />
          &nbsp;- expires: <b>{formatTimeInHours(validUntil, 'Never')}</b>
        </div>
        <button type="button" tabIndex={tabIndex} onClick={handleShowConfig} />
      </div>

      <OrderValidityInputsWrapper $visible={showOrderConfig} onKeyPress={onModalEnter}>
        <h4>
          Order settings <i onClick={handleShowConfig}>×</i>
        </h4>
        <OrderValidityBox>
          <strong>Order starts in (min)</strong>
          <label>
            <input
              className={validFromClassName}
              name={validFromInputId}
              type="text"
              disabled={isDisabled}
              required
              ref={(e): void => {
                register(e)
                validFromRef.current = e
              }}
              onFocus={(e): void => e.target.select()}
              tabIndex={tabIndex}
            />
            <div className="radio-container">
              <input
                type="checkbox"
                checked={isAsap}
                disabled={isDisabled}
                onChange={handleASAPClick}
                tabIndex={tabIndex}
              />
              <small>ASAP</small>
            </div>
          </label>
          <FormInputError errorMessage={validFromError?.message as string} />
        </OrderValidityBox>
        <OrderValidityBox>
          <strong>Order expires in (min)</strong>
          <label>
            <input
              className={validUntilClassName}
              name={validUntilInputId}
              type="text"
              disabled={isDisabled}
              required
              ref={(e): void => {
                register(e)
                validUntilRef.current = e
              }}
              onFocus={(e): void => e.target.select()}
              tabIndex={tabIndex}
            />
            <div className="radio-container">
              <input
                type="checkbox"
                disabled={isDisabled}
                checked={isUnlimited}
                onChange={handleUnlimitedClick}
                tabIndex={tabIndex}
              />
              <small>Never</small>
            </div>
          </label>
          <FormInputError errorMessage={validUntilError?.message as string} />
        </OrderValidityBox>
        <span>
          <button
            type="button"
            onClick={handleShowConfig}
            disabled={!!validUntilError || !!validFromError}
            tabIndex={tabIndex}
          >
            Set order parameters
          </button>
        </span>
      </OrderValidityInputsWrapper>
    </Wrapper>
  )
}

export default OrderValidity
