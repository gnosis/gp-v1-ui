import React, { useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'

import { TradeFormTokenId, TradeFormData } from './'
import { adjustPrecision } from '@gnosis.pm/dex-js'
import arrow from 'assets/img/arrow.svg'

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  flex-flow: row wrap;
  border-bottom: 0.1rem solid #dfe6ef;

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

    &:hover {
      background: transparent;
    }

    &::after {
      content: '';
      background: url(${arrow}) no-repeat center/contain;
      width: 1rem;
      height: 1.1rem;
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      transform: rotate(90deg);
    }
  }

  > button > b {
    color: #218dff;
    margin: 0 0.4rem;
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
  inputId: TradeFormTokenId
  isDisabled: boolean
  tabIndex: number
  isUnlimited: boolean
  setUnlimited: Dispatch<SetStateAction<boolean>>
}

const OrderValidity: React.FC<Props> = ({ inputId }) => {
  const { setValue, watch } = useFormContext<TradeFormData>()
  // const error = errors[inputId]
  const inputValue = watch(inputId)
  // const overMax = ZERO
  // const className = error ? 'error' : overMax.gt(ZERO) ? 'warning' : ''
  // const errorOrWarning = error && <WalletDetail className="error">{error.message}</WalletDetail>

  const handleChange = useCallback(() => {
    const newValue = adjustPrecision(inputValue, 0)
    if (inputValue !== newValue) {
      setValue(inputId, newValue, true)
    }
  }, [inputValue, setValue, inputId])

  useEffect(() => {
    handleChange()
  }, [handleChange])

  // function handleUnlimitedClick(): void {
  //   setUnlimited(!isUnlimited)
  //   !isUnlimited ? setValue(inputId, '', true) : setValue(inputId, '30', true)
  // }

  //TODO: re-enable input logic
  return (
    <Wrapper>
      <button>
        Order starts: <b>ASAP</b> - expires in: <b>30 minutes</b>
      </button>
      {/* <InputBox>
        <div className="main-input-container">
          <input
            className={className}
            name={inputId}
            type="number"
            step="5"
            disabled={isDisabled || isUnlimited}
            required
            ref={register({
              pattern: { value: validInputPattern, message: 'Expiration time cannot be negative' },
              validate: { positive: validatePositive },
            })}
            onChange={handleChange}
            onFocus={(e): void => e.target.select()}
            tabIndex={tabIndex + 2}
          />
          <div className="radio-container">
            <input type="checkbox" disabled={isDisabled} defaultChecked={isUnlimited} onClick={handleUnlimitedClick} />
            <small>Never</small>
          </div>
        </div>
        {errorOrWarning}
      </InputBox> */}
    </Wrapper>
  )
}

export default OrderValidity
