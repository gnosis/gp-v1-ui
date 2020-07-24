/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, Dispatch, SetStateAction, useEffect } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import styled from 'styled-components'
import { useFormContext, Controller, Control, FieldError } from 'react-hook-form'

// assets
import cog from 'assets/img/cog.svg'

// utils, const
import { makeMultipleOf, dateToBatchId, batchIdToDate } from 'utils'
import { MEDIA, VALID_FROM_DEFAULT } from 'const'

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
import { BATCH_TIME } from '@gnosis.pm/dex-js'

// now, 30min, 60min, 24h
const ORDER_START_PRESETS = [0, 30, 60, 1440]
// 5min, 30min, 24h, 7d
const ORDER_EXPIRE_PRESETS = [5, 30, 1440, 10080, 0]

const formatOrderValidityTimes = (
  validTime: string | number,
  matchedConstraintText: string,
  errorText = 'Invalid time - time cannot be negative',
): string => {
  const time = +validTime

  if (time < 0) return errorText
  else if (!time) return matchedConstraintText

  let convertedTime: number = time
  let timeFormat: string
  if (time <= 60) {
    timeFormat = 'min'
  } else if (time <= 1440) {
    convertedTime = time / 60
    timeFormat = 'hrs'
  } else {
    convertedTime = time / 1440
    timeFormat = 'days'
  }

  return !(convertedTime % 1) ? `${convertedTime} ${timeFormat}` : `~${convertedTime.toFixed(0)} ${timeFormat}`
}

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
            onChange(makeMultipleOf(5, dateToBatchId(e!)))
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
      position: relative;
      outline: 0;
      background: transparent;
      align-items: center;
      flex-flow: row wrap;
      padding: 1rem 0;
      line-height: 1.3;

      > div {
        display: grid;
        grid-template-columns: 9rem 1fr auto;
        width: 100%;

        > b {
          color: #218dff;
          margin: 0 0.4rem;
        }
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

const TimePickerPreset = styled.button<{ $selected?: boolean }>`
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0 0.85rem;

  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 100;
  background: var(--color-background-pageWrapper);

  border: 0.1rem solid var(--color-background-CTA);
  border-radius: 0.6rem;

  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: var(--color-background-CTA);
    color: var(--color-background-pageWrapper);
  }

  ${({ $selected = false }): string | false =>
    $selected &&
    `{
    background: var(--color-background-CTA);
    color: var(--color-background-pageWrapper);
  }`}

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
    min-width: 12rem;
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
  const [presetSelected, setPresetSelected] = useSafeState<{
    [key: string]: {
      time: number | null
      batchId: number | null
    }
  }>({})

  const { control, setValue, errors, register, getValues, watch } = useFormContext<TradeFormData>()
  const { validFrom: validFromBatchId, validUntil: validUntilBatchId } = getValues()
  console.debug('validFromBatchId, validUntilBatchId', validFromBatchId, validUntilBatchId)

  const validFromError = errors[validFromInputId]
  const validUntilError = errors[validUntilInputId]
  const validFromInputValue = watch(validFromInputId)
  const validUntilInputValue = watch(validUntilInputId)
  // const overMax = ZERO
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

  // This side effect is for not requiring disable on validFromBatchId/Until inputs
  // and auto-magically updating the checkbox/values on change
  // also allows auto focus and select when manually unchecking Now or Never checkboxes
  // useEffect(() => {
  //   // undefined validFromBatchId input - set Now
  //   !validFromInputValue
  //     ? batchedUpdates(() => {
  //         setAsap(true)
  //         setValue(validFromInputId, undefined, { shouldValidate: true })
  //       })
  //     : setAsap(false)
  //   // undefined validUntilBatchId input - set unlimited
  //   !validUntilInputValue
  //     ? batchedUpdates(() => {
  //         setUnlimited(true)
  //         setValue(validUntilInputId, undefined, { shouldValidate: true })
  //       })
  //     : setUnlimited(false)
  // }, [setAsap, setUnlimited, setValue, validFromInputValue, validFromInputId, validUntilInputValue, validUntilInputId])

  useEffect(() => {
    // If at least one time (validFrom/Until) was selected, run this logic
    if (presetSelected[validFromInputId]?.batchId || presetSelected[validUntilInputId]?.batchId) {
      // if user chooses validUntil to NEVER expire [null]
      if (!presetSelected[validUntilInputId]?.batchId) {
        setValue(validUntilInputId, undefined, { shouldValidate: true })
        return setValue(validFromInputId, presetSelected[validFromInputId].batchId!.toString(), {
          shouldValidate: true,
        })
        // else if user chooses validFrom to start NOW [null]
      } else if (!presetSelected[validFromInputId]?.batchId) {
        setValue(validFromInputId, undefined, { shouldValidate: true })
        return setValue(validUntilInputId, presetSelected[validUntilInputId].batchId!.toString(), {
          shouldValidate: true,
        })
      }

      // otherwise add the two batches and calc the different
      const adjustedUntilTime = Math.floor(
        presetSelected[validFromInputId].batchId! + presetSelected[validUntilInputId].batchId! - dateToBatchId(),
      )
      setValue(validUntilInputId, adjustedUntilTime.toString(), { shouldValidate: true })
      setValue(validFromInputId, presetSelected[validFromInputId].batchId!.toString(), { shouldValidate: true })
    } else {
      setValue(validFromInputId, undefined, { shouldValidate: true })
      return setValue(validUntilInputId, undefined, { shouldValidate: true })
    }
  }, [presetSelected, setValue, validFromInputId, validUntilInputId])

  function handlePresetClick(inputId: typeof validFromInputId | typeof validUntilInputId, time: number | null): void {
    // convert time to batchId
    const batchId = time ? (time * 60) / BATCH_TIME + dateToBatchId() : time
    setPresetSelected(state => ({
      ...state,
      [inputId]: {
        time,
        batchId,
      },
    }))
  }

  function handleUnlimitedClick(): void {
    setUnlimited(isUnlimited => !isUnlimited)
    if (!isUnlimited) {
      batchedUpdates(() => {
        handlePresetClick(validUntilInputId, null)
        return setValue(validUntilInputId, undefined, { shouldValidate: true })
      })
    }

    batchedUpdates(() => {
      handlePresetClick(validUntilInputId, null)
      setValue(validUntilInputId, VALID_FROM_DEFAULT, { shouldValidate: true })
    })
  }

  function handleASAPClick(): void {
    setAsap(isAsap => !isAsap)
    if (!isAsap) {
      batchedUpdates(() => {
        handlePresetClick(validFromInputId, null)
        return setValue(validFromInputId, undefined, { shouldValidate: true })
      })
    }
    batchedUpdates(() => {
      handlePresetClick(validFromInputId, null)
      setValue(validFromInputId, VALID_FROM_DEFAULT, { shouldValidate: true })
    })
  }

  return (
    <Wrapper>
      <div>
        <div>
          <div>
            Order starts: <b>{validFromBatchId ? batchIdToDate(+validFromBatchId).toLocaleString() : 'Now'}</b>
            <HelpTooltip tooltip={OrderStartsTooltip} />
          </div>
          <div>
            Order expires: <b>{formatOrderValidityTimes(+validUntilBatchId!, 'Never')}</b>
          </div>
        </div>
        <button type="button" tabIndex={tabIndex} onClick={handleShowConfig} />
      </div>

      <OrderValidityInputsWrapper $visible={showOrderConfig} onKeyPress={onModalEnter}>
        <h4>
          Order settings <i onClick={handleShowConfig}>×</i>
        </h4>
        <div>
          <OrderValidityBox>
            <p>
              Order starts:{' '}
              {validFromInputValue
                ? `${validFromInputValue} - ${new Date(batchIdToDate(+validFromInputValue))}`
                : 'Now'}
            </p>
            <TimePickerWrapper>
              {ORDER_START_PRESETS.map(time => {
                let conditionalProps = {}
                if (time) {
                  conditionalProps = {
                    onClick: (): void => handlePresetClick(validFromInputId, time),
                    $selected: presetSelected[validFromInputId]?.time === time,
                  }
                } else {
                  conditionalProps = {
                    onClick: handleASAPClick,
                    $selected: !presetSelected[validFromInputId]?.time,
                  }
                }

                return (
                  <TimePickerPreset
                    key={time}
                    disabled={isDisabled}
                    name={validFromInputId}
                    ref={register}
                    tabIndex={tabIndex}
                    type="button"
                    {...conditionalProps}
                  >
                    {formatOrderValidityTimes(time!, 'Now')}
                  </TimePickerPreset>
                )
              })}
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
            <p>Order expires:</p>
            <TimePickerWrapper>
              {ORDER_EXPIRE_PRESETS.map(time => {
                let conditionalProps = {}
                if (time) {
                  conditionalProps = {
                    onClick: (): void => handlePresetClick(validUntilInputId, time),
                    $selected: presetSelected[validUntilInputId]?.time === time,
                  }
                } else {
                  conditionalProps = {
                    onClick: handleUnlimitedClick,
                    $selected: !presetSelected[validUntilInputId]?.time,
                  }
                }

                return (
                  <TimePickerPreset
                    key={time}
                    disabled={isDisabled}
                    name={validUntilInputId}
                    ref={register}
                    tabIndex={tabIndex}
                    type="button"
                    {...conditionalProps}
                  >
                    {formatOrderValidityTimes(time!, 'Never')}
                  </TimePickerPreset>
                )
              })}
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
