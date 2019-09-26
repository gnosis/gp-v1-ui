import React, { useState, useEffect, ChangeEvent, ReactNode } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'

import { TokenBalanceDetails } from 'types'
import { formatAmountFull, parseAmount } from 'utils'
import BN from 'bn.js'

const Wrapper = styled.tr`
  background-color: #f7f0ff;

  td {
    position: relative;
  }

  span.symbol {
    color: #b02ace;
  }

  h4 {
    margin: 0;
    font-size: 1.3em;
  }

  ul {
    align-items: center;
    list-style: none;
    text-align: left;

    li {
      display: block;
      margin: 0 auto;
      width: 25em;
    }

    li > label {
      width: 9em;
      color: #6c0084;
      font-weight: bold;
      text-align: right;
    }

    p.error {
      color: red;
      padding: 0 0 0.5em 10em;
      margin: 0;
    }

    div.wallet {
      display: inline-block;
      text-align: center;
      position: relative;

      a.max {
        display: inline-block;
        margin-left: 0.5em;
        position: absolute;
        top: 1.3em;
        right: -3em;
      }
    }

    li > label {
      display: inline-block;
      height: 100%;
    }

    .buttons {
      text-align: center;
      padding-top: 1em;
      button {
        min-width: 7em;
        margin-left: 1.2em;
      }
    }
  }

  .times {
    position: absolute;
    top: 0;
    right: 0;
    text-decoration: none;
    font-size: 2em;
    display: inline-block;
    padding: 0 0.5em 0 0;
  }
`

export interface FormProps {
  tokenBalances: TokenBalanceDetails
  title: ReactNode
  totalAmountLabel: string
  totalAmount: BN
  inputLabel: string
  submitBtnLabel: string
  submitBtnIcon: IconDefinition
  onSubmit: () => Promise<void>
  onClose: () => void
}

interface Errors {
  amountInput: string
}

function _validateForm(totalAmount: BN, amountInput: string, decimals: number): string {
  if (!amountInput) {
    return 'Required amount'
  }

  const amount = parseAmount(amountInput, decimals)

  if (!amount || amount.isZero()) {
    return 'Invalid amount'
  }

  if (amount.gt(totalAmount)) {
    return 'Insuficient balance'
  }

  return null // no error
}

export const Form: React.FC<FormProps> = (props: FormProps) => {
  const { symbol, decimals } = props.tokenBalances
  const { title, totalAmount, totalAmountLabel, inputLabel, submitBtnLabel, submitBtnIcon } = props
  const [amountInput, setAmountInput] = useState('')
  const [validatorActive, setValidatorActive] = useState(false)
  const [errors, setErrors] = useState<Errors>({
    amountInput: null,
  })

  const cancelForm = (): void => {
    setAmountInput('')
    props.onClose()
  }

  useEffect(() => {
    if (validatorActive) {
      // Verify on every amount change
      const errorMsg = _validateForm(totalAmount, amountInput, decimals)
      const newErrors = {
        ...errors,
        amountInput: errorMsg,
      }
      setErrors(newErrors)
      // const hasErrors = Object.keys(newErrors).some(key => !!newErrors[key])
      // return !hasErrors
    }
  }, [amountInput, validatorActive])

  return (
    <Wrapper>
      <td colSpan={6}>
        <a className="times" onClick={cancelForm}>
          &times;
        </a>
        <h4>{title}</h4>
        <ul>
          <li>
            <label>{totalAmountLabel}</label>
            <div className="wallet">
              <input type="text" value={formatAmountFull(totalAmount, decimals)} disabled />
              <br />
              <a className="max" onClick={(): void => setAmountInput(formatAmountFull(totalAmount, decimals, false))}>
                <small>Use Max</small>
              </a>
            </div>
          </li>
          <li>
            <label>{inputLabel}</label>
            <input
              type="text"
              value={amountInput}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setAmountInput(e.target.value)}
              placeholder={symbol + ' amount'}
            />
            {errors.amountInput && <p className="error">{errors.amountInput}</p>}
          </li>
          <li className="buttons">
            <a onClick={cancelForm}>Cancel</a>
            <button
              type="button"
              className="success"
              disabled={!!errors.amountInput}
              onClick={(): void => {
                setValidatorActive(true)
                // TODO: Improve. Do not do 2 times the validation
                const error = _validateForm(totalAmount, amountInput, decimals)
                if (!error) {
                  props.onSubmit()
                }
              }}
            >
              <FontAwesomeIcon icon={submitBtnIcon} />
              &nbsp; {submitBtnLabel}
            </button>
          </li>
        </ul>
      </td>
    </Wrapper>
  )
}

export default Form
