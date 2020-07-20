/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, Dispatch, SetStateAction, useRef, useEffect } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import styled from 'styled-components'
import { useFormContext, Controller, Control, FieldError } from 'react-hook-form'

// assets
import cog from 'assets/img/cog.svg'

// utils, const
import { ZERO } from '@gnosis.pm/dex-js'
import { formatTimeInHours, makeMultipleOf, dateToBatchId, batchIdToDate } from 'utils'
import { MEDIA, VALID_UNTIL_DEFAULT, VALID_FROM_DEFAULT } from 'const'

// components
import { HelpTooltipContainer, HelpTooltip } from 'components/Tooltip'

// TradeWidget: subcomponents
import { TradeFormTokenId, TradeFormData } from 'components/TradeWidget'
import { FormInputError } from 'components/TradeWidget/FormMessage'

// hooks
import useSafeState from 'hooks/useSafeState'

import { DateTimePicker, BaseDateTimePickerProps } from '@material-ui/pickers'
import TextField from '@material-ui/core/TextField'
import DateFnsAdapter from '@material-ui/pickers/adapter/date-fns'

const ORDER_START_PRESETS = [10, 15, 20]
const ORDER_EXPIRE_PRESETS = [5, 15, 30]

interface TimePickerProps extends BaseDateTimePickerProps {
  control: Control<TradeFormData>
  formValues: {
    value: string
    setValue: Function
    errors?: FieldError
    inputName: keyof TradeFormData
  }
}

const TimePicker: React.FC<TimePickerProps> = ({ control, formValues, minDate = new Date(), ...restProps }) => {
  // const [selectedDate, handleDateChange] = useSafeState<Date | null>(new Date())

  const memoizedDateAdapter = React.useMemo(() => {
    return new DateFnsAdapter()
  }, [])

  const currentError = formValues.errors

  return (
    <Controller
      render={({ onChange }): JSX.Element => (
        <DateTimePicker
          {...restProps}
          onChange={(e): void => {
            console.debug('EVENT::', e, 'BATCHID::', dateToBatchId(e))
            onChange(makeMultipleOf(5, dateToBatchId(e)))
          }}
          dateAdapter={memoizedDateAdapter}
          value={batchIdToDate(Number(formValues.value))}
          renderInput={(props): JSX.Element => (
            <TextField
              {...props}
              label="Set custom date"
              name={formValues.inputName}
              error={Boolean(currentError)}
              helperText={currentError && <FormInputError errorMessage={currentError.message} />}
              // Make sure that your 3d param is set to `true` in order to run validation
              // onBlur={() => form.setFieldTouched(name, true, true)}
            />
          )}
          inputFormat="yyyy/MM/dd HH:mm a"
          ampm={false}
          minDate={minDate}
        />
      )}
      control={control}
      name={formValues.inputName}
      placeholder="Valid From Date"
    />
  )
}

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  flex-flow: row wrap;
  border-bottom: 0.1rem solid var(--color-background-banner);

  > input,
  button {
    width: 100%;
    color: var(--color-text-primary);
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

const OrderValidityBox = styled.div`
  width: 90%;
  margin: auto;

  > strong {
    margin-bottom: 1rem;
  }

  > input[type='checkbox'] {
    margin: auto;
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
    margin: 0;
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

  .tabsList {
    height: 4rem;
    margin-bottom: 2rem;
    border: none;

    button {
      border-radius: 0 0 1.6rem 0;

      &.selected {
        flex: 1 1 75%;
      }

      transition: all 0.3s ease-in-out;
    }
  }

  label > input:not([type='checkbox']) {
    padding: 0 6.5rem 0 1rem;
  }

  > div {
    width: 100%;

    ${OrderValidityBox} {
      padding: 0 0.8rem;

      @media ${MEDIA.mobile} {
        padding: 0 1.6rem;
      }

      > p {
        text-transform: capitalize;
        color: var(--color-text-primary);
        font-size: 1.2rem;
        width: 100%;
        padding: 0;
        box-sizing: border-box;
      }
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

const TimePickerPreset = styled.button`
  height: 100%;
  padding: 0;
  margin: 0 0.85rem;
  font-size: 1rem;
  background: var(--color-background-pageWrapper);
  border: 0.2rem solid var(--color-background-CTA);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: var(--color-background-CTA);
    color: var(--color-background-pageWrapper);
  }

  &:focus {
    border-color: var(--color-background-CTA);
  }
`

const TimePickerWrapper = styled.div`
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  height: 4rem;

  > .MuiFormControl-root,
  .MuiTextField-root {
    min-width: 10rem;
  }
`

const OrderStartsTooltip = (
  <HelpTooltipContainer>
    Orders configured to start <strong>now</strong> will be considered for the next batch. Click the ⚙️ icon on the
    right to customise order validity times.
  </HelpTooltipContainer>
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

  const { control, setValue, errors, register, getValues, watch } = useFormContext<TradeFormData>()
  const { validFrom, validUntil } = getValues()
  console.debug('validFrom, validUntil', validFrom, validUntil)

  const validFromError = errors[validFromInputId]
  const validUntilError = errors[validUntilInputId]
  const validFromInputValue = watch(validFromInputId)
  const validUntilInputValue = watch(validUntilInputId)
  const overMax = ZERO
  // const validFromClassName = validFromError ? 'error' : overMax.gt(ZERO) ? 'warning' : ''
  // const validUntilClassName = validUntilError ? 'error' : overMax.gt(ZERO) ? 'warning' : ''

  const handleShowConfig = useCallback((): void => {
    if (showOrderConfig) {
      console.debug('validFromInputValue::', validFromInputValue)
      // sanitize inputs as multiples of 5
      const sanitizedFromValue = makeMultipleOf(5, validFromInputValue)
      const sanitizedUntilValue = makeMultipleOf(5, validUntilInputValue)

      batchedUpdates(() => {
        if (!sanitizedFromValue || !sanitizedUntilValue) {
          !sanitizedFromValue
            ? (setAsap(true), setValue(validFromInputId, undefined, { shouldValidate: true }))
            : setValue(validFromInputId, sanitizedFromValue.toString(), { shouldValidate: true })
          !sanitizedUntilValue
            ? (setUnlimited(true), setValue(validUntilInputId, undefined, { shouldValidate: true }))
            : setValue(validUntilInputId, sanitizedUntilValue.toString(), { shouldValidate: true })
        }
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

  const validFromRef: React.MutableRefObject<HTMLInputElement | HTMLButtonElement | null> = useRef(null)
  const validUntilRef: React.MutableRefObject<HTMLInputElement | HTMLButtonElement | null> = useRef(null)

  // This side effect is for not requiring disable on validFrom/Until inputs
  // and auto-magically updating the checkbox/values on change
  // also allows auto focus and select when manually unchecking Now or Never checkboxes
  useEffect(() => {
    // undefined validFrom input - set Now
    !validFromInputValue
      ? batchedUpdates(() => {
          setAsap(true)
          setValue(validFromInputId, undefined, { shouldValidate: true })
        })
      : setAsap(false)
    // undefined validUntil input - set unlimited
    !validUntilInputValue
      ? batchedUpdates(() => {
          setUnlimited(true)
          setValue(validUntilInputId, undefined, { shouldValidate: true })
        })
      : setUnlimited(false)
  }, [setAsap, setUnlimited, setValue, validFromInputValue, validFromInputId, validUntilInputValue, validUntilInputId])

  function handleUnlimitedClick(): void {
    const reffedInput = validUntilRef.current!
    setUnlimited(isUnlimited => !isUnlimited)
    if (!isUnlimited) {
      return setValue(validUntilInputId, undefined, { shouldValidate: true })
    }

    reffedInput.focus()
    setValue(validUntilInputId, VALID_UNTIL_DEFAULT, { shouldValidate: true })
    reffedInput.select()
  }
  function handleASAPClick(): void {
    const reffedInput = validFromRef.current!
    setAsap(isAsap => !isAsap)
    if (!isAsap) {
      return setValue(validFromInputId, undefined, { shouldValidate: true })
    }
    reffedInput.focus()
    setValue(validFromInputId, VALID_FROM_DEFAULT, { shouldValidate: true })
    reffedInput.select()
  }

  return (
    <Wrapper>
      <div>
        <div>
          Order starts:{' '}
          <b>
            {new Date(Number(validFrom! * 1000)).toString()} / {Number(validFrom!)}
          </b>
          {/* <b>{formatTimeInHours(validFrom!, 'Now')}</b> */}
          <HelpTooltip tooltip={OrderStartsTooltip} />
          &nbsp;- expires: <b>{formatTimeInHours(validUntil!, 'Never')}</b>
        </div>
        <button type="button" tabIndex={tabIndex} onClick={handleShowConfig} />
      </div>

      <OrderValidityInputsWrapper $visible={showOrderConfig} onKeyPress={onModalEnter}>
        <h4>
          Order settings <i onClick={handleShowConfig}>×</i>
        </h4>
        {/* <Tabs className="tabsList" {...tabsProps} /> */}

        {/* TODO: fix this crap with display */}
        {/* <div
          style={{
            display: selectedTab === 'basic' ? 'flex' : 'none',
            flexFlow: 'row nowrap',
            justifyContent: 'center',
          }}
        >
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
                  register(e!)
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
                <small>Now</small>
              </div>
            </label>
            <FormInputError errorMessage={validFromError?.message as string} />
          </OrderValidityBox>
          <OrderValidityBox>
            <strong>Order expires in (min)</strong>
            <label>
              <input
                className={validUntilClassName}
                type="text"
                required
                onFocus={(e): void => e.target.select()}
                name={validUntilInputId}
                disabled={isDisabled}
                ref={(e): void => {
                  register(e!)
                  validUntilRef.current = e
                }}
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
        </div> */}
        <div>
          <OrderValidityBox>
            <p>Order starts in:</p>
            <TimePickerWrapper>
              <TimePickerPreset
                type="button"
                value="Now"
                // checked={isAsap}
                disabled={isDisabled}
                onClick={handleASAPClick}
                tabIndex={tabIndex}
              >
                Now
              </TimePickerPreset>
              {ORDER_START_PRESETS.map(time => (
                <TimePickerPreset
                  key={time}
                  className="timeSelectPresets"
                  type="button"
                  // onClick={console.debug}
                  name={validFromInputId}
                  disabled={isDisabled}
                  ref={(e): void => {
                    register(e!)
                    validFromRef.current = e
                  }}
                  tabIndex={tabIndex}
                >
                  {time + 'min'}
                </TimePickerPreset>
              ))}
              <TimePicker
                control={control}
                formValues={{
                  value: validFromInputValue!,
                  setValue,
                  errors: validFromError,
                  inputName: validFromInputId,
                }}
              />
            </TimePickerWrapper>
          </OrderValidityBox>
          <OrderValidityBox>
            <p>Order expires in:</p>
            <TimePickerWrapper>
              <TimePickerPreset
                type="button"
                // checked={isUnlimited}
                disabled={isDisabled}
                onClick={handleUnlimitedClick}
                tabIndex={tabIndex}
              >
                Never
              </TimePickerPreset>
              {ORDER_EXPIRE_PRESETS.map(time => (
                <TimePickerPreset
                  key={time}
                  className="timeSelectPresets"
                  type="button"
                  // onClick={console.debug}
                  name={validUntilInputId}
                  disabled={isDisabled}
                  ref={(e): void => {
                    register(e!)
                    validUntilRef.current = e
                  }}
                  tabIndex={tabIndex}
                >
                  {time + 'min'}
                </TimePickerPreset>
              ))}
              <TimePicker
                control={control}
                formValues={{
                  value: validFromInputValue!,
                  setValue,
                  errors: validFromError,
                  inputName: validFromInputId,
                }}
              />
            </TimePickerWrapper>
          </OrderValidityBox>
        </div>
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
