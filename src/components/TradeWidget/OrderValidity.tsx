import React, { useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'

import { TradeFormTokenId, TradeFormData, PriceInputBox } from './'
import { adjustPrecision, ZERO } from '@gnosis.pm/dex-js'
import cog from 'assets/img/cog.svg'
import useSafeState from 'hooks/useSafeState'
import { validInputPattern, validatePositive, formatValidity } from 'utils'

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
  opacity: ${({ $visible }): string => ($visible ? '1' : '0')};
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
  height: 12.7rem;
  padding: 1rem 4rem;
  border-radius: 0.8rem;

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;

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
    padding: 0.6rem 1.2rem;
    color: white;
    margin: 1rem auto;
  }
`

// const InputBox = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: stretch;
//   flex-grow: 1;

//   margin-left: 1em;

//   > div {
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     > input[type='radio'] {
//       width: 20%;
//     }
//   }

//   .radio-container {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//   }

//   input {
//     margin: 0;
//     width: 100%;

//     &.error {
//       // box-shadow: 0 0 0.1875rem #cc0000;
//       border-color: #ff0000a3;
//     }

//     &.warning {
//       // box-shadow: 0 0 0.1875rem #ff7500;
//       border-color: orange;
//     }

//     &:disabled {
//       box-shadow: none;
//     }
//   }
// `

// const WalletDetail = styled.div`
//   display: flex;
//   justify-content: space-between;
//   font-size: 0.75em;

//   .success {
//     color: green;
//     text-decoration: none;
//   }

//   &.error,
//   &.warning {
//     margin: 0 0 1em 0;
//   }

//   &.error {
//     color: red;
//   }
//   &.warning {
//     color: orange;
//   }
// `

// function validatePositive(value: string): true | string {
//   return Number(value) == 0 || Number(value) >= 5 || 'Invalid expiration time'
// }

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

  // const validFromErrorComp = validFromError && <WalletDetail className="error">{validFromError.message}</WalletDetail>
  // const validUntilErrorComp = validUntilError && (
  //   <WalletDetail className="error">{validUntilError.message}</WalletDetail>
  // )

  const handleShowConfig = (): void => setShowOrderConfig(!showOrderConfig)

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
    setUnlimited(!isUnlimited)
    !isUnlimited ? setValue(validUntilInputId, '', true) : setValue(validUntilInputId, '30', true)
  }
  function handleASAPClick(): void {
    setAsap(!isAsap)
    !isAsap ? setValue(validFromInputId, '', true) : setValue(validFromInputId, '30', true)
  }

  //TODO: re-enable input logic
  return (
    <Wrapper>
      <button onClick={handleShowConfig}>
        Order starts: <b>{formatValidity(validFrom, 'ASAP')}</b> - expires in:{' '}
        <b>{formatValidity(validUntil, 'Never')}</b>
      </button>

      <OrderValidityInputsWrapper $visible={showOrderConfig}>
        <PriceInputBox>
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
            {/* {validFromErrorComp} */}
          </label>
        </PriceInputBox>
        <PriceInputBox>
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
                validate: { positive: validatePositive },
              })}
              onChange={handleValidUntilChange}
              onFocus={(e): void => e.target.select()}
              tabIndex={tabIndex + 2}
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
            {/* {validUntilErrorComp} */}
          </label>
        </PriceInputBox>
        <button onClick={(): void => setShowOrderConfig(false)}>Set order parameters</button>
      </OrderValidityInputsWrapper>
    </Wrapper>
  )
}

export default OrderValidity
