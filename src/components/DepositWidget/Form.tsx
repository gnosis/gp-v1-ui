import React, { useState, useEffect, ChangeEvent, ReactNode, useRef } from 'react'
import BN from 'bn.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition, faSpinner } from '@fortawesome/free-solid-svg-icons'

import { DynamicWrapper, InnerWrapper } from './Styled'

import { TokenBalanceDetails } from 'types'
import { formatAmountFull, parseAmount } from 'utils'

export interface FormProps {
  tokenBalances: TokenBalanceDetails
  title: ReactNode
  totalAmountLabel: string
  totalAmount: BN
  inputLabel: string
  responsive?: boolean
  submitBtnLabel: string
  submitBtnIcon: IconDefinition
  onSubmit: (amount: BN) => Promise<void>
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
    return 'Insufficient balance'
  }

  return null // no error
}

export const Form: React.FC<FormProps> = (props: FormProps) => {
  const { symbol, decimals } = props.tokenBalances
  const { title, totalAmount, totalAmountLabel, inputLabel, responsive, submitBtnLabel, submitBtnIcon } = props
  const [amountInput, setAmountInput] = useState('')
  const [validatorActive, setValidatorActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Errors>({
    amountInput: null,
  })
  const mounted = useRef(true)

  const cancelForm = (): void => {
    setAmountInput('')
    props.onClose()
  }

  useEffect(() => {
    if (validatorActive) {
      // Verify on every amount change
      const errorMsg = _validateForm(totalAmount, amountInput, decimals)
      setErrors(oldErrors => ({
        ...oldErrors,
        amountInput: errorMsg,
      }))
    }
  }, [amountInput, decimals, totalAmount, validatorActive])

  // Separated useEffect only for the cleanUp when the component unmounts
  // Note the empty list as the last argument
  useEffect(() => {
    return function cleanUp(): void {
      mounted.current = false
    }
  }, [])

  const _onClick = (): void => {
    setValidatorActive(true)
    // TODO: Improve. Do not do 2 times the validation
    const error = _validateForm(totalAmount, amountInput, decimals)
    if (!error) {
      setLoading(true)
      props.onSubmit(parseAmount(amountInput, decimals)).then(() => {
        if (mounted.current) {
          setLoading(false)
          setValidatorActive(false)
          cancelForm()
        }
      })
    }
  }

  return (
    <DynamicWrapper responsive={responsive}>
      <InnerWrapper>
        <a className="times" onClick={cancelForm}>
          &times;
        </a>
        <div>
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
              <button type="button" className="success" disabled={!!errors.amountInput || loading} onClick={_onClick}>
                <FontAwesomeIcon icon={loading ? faSpinner : submitBtnIcon} spin={loading} />
                &nbsp; {submitBtnLabel}
              </button>
            </li>
          </ul>
        </div>
      </InnerWrapper>
    </DynamicWrapper>
  )
}

export default Form
