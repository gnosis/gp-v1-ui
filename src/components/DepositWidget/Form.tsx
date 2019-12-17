import React, { useEffect, ChangeEvent, ReactNode } from 'react'
import BN from 'bn.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition, faSpinner } from '@fortawesome/free-solid-svg-icons'

import { DynamicWrapper, InnerWrapper, LineSeparator } from './Styled'

import useSafeState from 'hooks/useSafeState'

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

function _validateForm(totalAmount: BN, amountInput: string, decimals: number): string | null {
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
  const [amountInput, setAmountInput] = useSafeState('')
  const [validatorActive, setValidatorActive] = useSafeState(false)
  const [loading, setLoading] = useSafeState(false)
  const [errors, setErrors] = useSafeState<Errors>({
    amountInput: '',
  })

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
        amountInput: errorMsg || '',
      }))
    }
  }, [amountInput, decimals, setErrors, totalAmount, validatorActive])

  const _onClick = (): void => {
    setValidatorActive(true)
    // TODO: Improve. Do not do 2 times the validation
    const error = _validateForm(totalAmount, amountInput, decimals)
    if (!error) {
      setLoading(true)
      const parsedAmt = parseAmount(amountInput, decimals)
      parsedAmt &&
        props.onSubmit(parsedAmt).then(() => {
          setLoading(false)
          setValidatorActive(false)
          cancelForm()
        })
    }
  }

  return (
    <DynamicWrapper responsive={!!responsive}>
      <InnerWrapper>
        <a className="times" onClick={cancelForm}>
          &times;
        </a>
        <div>
          <h4>{title}</h4>
          <div className="WalletItemContainer">
            {/* Withdraw Row */}
            <div className="wallet">
              <p>{totalAmountLabel}</p>
              <LineSeparator />
              <input type="text" value={formatAmountFull(totalAmount, decimals) || ''} disabled />
              <a
                className="max"
                onClick={(): void => setAmountInput(formatAmountFull(totalAmount, decimals, false) || '')}
              >
                <small>Use Max</small>
              </a>
            </div>
            {/* Deposit Row */}
            <div className="wallet">
              <p>{inputLabel}</p>
              <LineSeparator />
              <input
                type="text"
                value={amountInput}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setAmountInput(e.target.value)}
                placeholder={symbol + ' amount'}
              />
            </div>
            {/* Error Message */}
            <p className="error">{errors.amountInput || ''}</p>
            {/* Submit/Cancel Buttons */}
            <div style={{ margin: 'auto' }}>
              <a onClick={cancelForm}>Cancel</a>
              <button type="button" disabled={!!errors.amountInput || loading} onClick={_onClick}>
                <FontAwesomeIcon icon={loading ? faSpinner : submitBtnIcon} spin={loading} />
                &nbsp; {submitBtnLabel}
              </button>
            </div>
          </div>
        </div>
      </InnerWrapper>
    </DynamicWrapper>
  )
}

export default Form
