/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, Dispatch, SetStateAction, useEffect } from 'react'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'

// assets
import cog from 'assets/img/cog.svg'

// utils, const
import {
  formatDistanceStrict,
  makeMultipleOf,
  dateToBatchId,
  batchIdToDate,
  formatDateFromBatchId,
  formatDate,
} from 'utils'
import { MEDIA } from 'const'

// components
import { HelpTooltipContainer, HelpTooltip } from 'components/Tooltip'
import DateTimePickerControl, { DateTimePickerWrapper } from 'components/TimePicker'

// TradeWidget: subcomponents
import { TradeFormTokenId, TradeFormData } from 'components/TradeWidget'

// hooks
import useSafeState from 'hooks/useSafeState'

const VALID_UNTIL_DEFAULT = '1440'
const VALID_FROM_DEFAULT = '30'
// now, 30min, 60min, 24h
const ORDER_START_PRESETS = ['0', '10', '30', '60', '1440']
// 5min, 30min, 24h, 7d
const ORDER_EXPIRE_PRESETS = ['5', '30', '1440', '10080', '0']

const minutesToRelativeBatchId = (minutes: number): number => {
  const minutesAddedToCurrentTime = Date.now() + minutes * 60000
  return dateToBatchId(minutesAddedToCurrentTime)
}

function getNumberOfBatchesLeftUntilNow(batchId: number): number {
  const nowAsBatchId = dateToBatchId()
  const batchDifference = batchId - nowAsBatchId

  if (batchDifference <= 0) return 0

  return batchDifference
}

const formatOrderValidityTimes = (
  validTime: string | number | null,
  matchedConstraintText: string,
  errorText = 'Invalid time - time cannot be negative',
): string => {
  if (!validTime) return matchedConstraintText

  const time = +validTime
  if (time < 0) return errorText

  let convertedTime: number = time
  let timeFormat: string
  if (time <= 60) {
    timeFormat = 'min'
  } else if (time <= 1440) {
    convertedTime = time / 60
    timeFormat = 'hrs'
  } else if (time > 1440 && time <= 43200) {
    convertedTime = time / 1440
    timeFormat = 'days'
  } else {
    convertedTime = time / 43200
    timeFormat = 'months'
  }

  return !(convertedTime % 1) ? `${convertedTime} ${timeFormat}` : `~${convertedTime.toFixed(0)} ${timeFormat}`
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
        grid-template-columns: 9rem min-content auto;
        width: 100%;

        > b {
          color: #218dff;
          margin: 0 0.4rem;
          white-space: nowrap;
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
        height: 2.4rem;
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
  transition: background 0.2s ease-in-out;

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
  // setAsap,
  // setUnlimited,
  isAsap,
  tabIndex,
  validFromInputId,
  validUntilInputId,
}) => {
  const [showOrderConfig, setShowOrderConfig] = useSafeState(false)
  const [presetSelected, setPresetSelected] = useSafeState<{
    [key: string]: {
      time?: string | null
      batchId?: number | null
      isCustomTime?: boolean
    }
  }>(() => ({
    [validFromInputId]: {
      time: isAsap ? null : VALID_FROM_DEFAULT,
      batchId: minutesToRelativeBatchId(+VALID_FROM_DEFAULT),
    },
    [validUntilInputId]: {
      time: isUnlimited ? null : VALID_UNTIL_DEFAULT,
      batchId: minutesToRelativeBatchId(+VALID_UNTIL_DEFAULT),
    },
  }))

  const formMethods = useFormContext<TradeFormData>()
  const { control, setValue, errors, register, getValues, watch } = formMethods
  const { validFrom: validFromBatchId, validUntil: validUntilBatchId } = getValues()
  // console.debug('validFromBatchId, validUntilBatchId', validFromBatchId, validUntilBatchId)

  const validFromError = errors[validFromInputId]
  const validUntilError = errors[validUntilInputId]
  const validFromInputValue = watch(validFromInputId)
  const validUntilInputValue = watch(validUntilInputId)
  // const overMax = ZERO
  // const validFromClassName = validFromError ? 'error' : overMax.gt(ZERO) ? 'warning' : ''
  // const validUntilClassName = validUntilError ? 'error' : overMax.gt(ZERO) ? 'warning' : ''

  const handleShowConfig = useCallback((): void => {
    // if (showOrderConfig) {
    //   // sanitize inputs as multiples of 5
    //   const sanitizedFromValue = makeMultipleOf(5, validFromInputValue)
    //   const sanitizedUntilValue = makeMultipleOf(5, validUntilInputValue)

    //   batchedUpdates(() => {
    //     if (!sanitizedFromValue || !sanitizedUntilValue) {
    //       !sanitizedFromValue
    //         ? (setAsap(true), setValue(validFromInputId, undefined, { shouldValidate: true }))
    //         : setValue(validFromInputId, sanitizedFromValue.toString(), { shouldValidate: true })
    //       !sanitizedUntilValue
    //         ? (setUnlimited(true), setValue(validUntilInputId, undefined, { shouldValidate: true }))
    //         : setValue(validUntilInputId, sanitizedUntilValue.toString(), { shouldValidate: true })
    //     }
    //   })
    // }

    setShowOrderConfig(showOrderConfig => !showOrderConfig)
  }, [
    setShowOrderConfig,
    // setAsap,
    // setUnlimited,
    // setValue,
    // validFromInputId,
    // validFromInputValue,
    // validUntilInputId,
    // validUntilInputValue,
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

  useEffect(() => {
    // If at least one time (validFrom/Until) was selected, run this logic
    if (presetSelected[validFromInputId]?.batchId || presetSelected[validUntilInputId]?.batchId) {
      // if user chooses validUntil to NEVER expire [null]
      if (!presetSelected[validUntilInputId]?.batchId) {
        setValue(validUntilInputId, null, { shouldValidate: true })
        return setValue(validFromInputId, presetSelected[validFromInputId].batchId!.toString(), {
          shouldValidate: true,
        })
        // else if user chooses validFrom to start NOW [null]
      } else if (!presetSelected[validFromInputId]?.batchId) {
        setValue(validFromInputId, null, { shouldValidate: true })
        return setValue(validUntilInputId, presetSelected[validUntilInputId].batchId!.toString(), {
          shouldValidate: true,
        })
      }

      // otherwise add the two batches and calc the different
      const adjustedUntilTime =
        presetSelected[validFromInputId].batchId! >= presetSelected[validUntilInputId].batchId!
          ? Math.floor(
              presetSelected[validFromInputId].batchId! + presetSelected[validUntilInputId].batchId! - dateToBatchId(),
            )
          : presetSelected[validUntilInputId].batchId!
      setValue(validUntilInputId, adjustedUntilTime.toString(), { shouldValidate: true })
      setValue(validFromInputId, presetSelected[validFromInputId].batchId!.toString(), { shouldValidate: true })
    } else {
      setValue(validFromInputId, null, { shouldValidate: true })
      return setValue(validUntilInputId, null, { shouldValidate: true })
    }
  }, [presetSelected, setValue, validFromInputId, validUntilInputId])

  function handlePresetClick(
    inputId: typeof validFromInputId | typeof validUntilInputId,
    time: string | null | undefined,
    isCustomTime?: boolean,
  ): void {
    // convert time to batchId
    const batchId = isCustomTime && time ? +time : time && +time ? minutesToRelativeBatchId(+time) : null
    setPresetSelected(state => ({
      ...state,
      [inputId]: {
        time,
        batchId,
        isCustomTime,
      },
    }))
  }

  return (
    <Wrapper>
      <div>
        <div>
          <div>
            Order starts:{' '}
            <b>
              {validFromBatchId
                ? getNumberOfBatchesLeftUntilNow(+validFromBatchId) > 3
                  ? formatDate(batchIdToDate(+validFromBatchId), 'yyyy.MM.dd HH:mm')
                  : formatDateFromBatchId(presetSelected[validFromInputId].batchId!)
                : 'Now'}
            </b>
            <HelpTooltip tooltip={OrderStartsTooltip} />
          </div>
          <div>
            Order expires:{' '}
            <b>
              {validUntilBatchId
                ? formatDistanceStrict(
                    batchIdToDate(+validUntilBatchId),
                    validFromBatchId ? batchIdToDate(+validFromBatchId) : Date.now(),
                    { addSuffix: true },
                  )
                : 'Never'}
            </b>
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
            <DateTimePickerWrapper $customDateSelected={presetSelected[validFromInputId]?.isCustomTime}>
              {ORDER_START_PRESETS.map(time => {
                const props = {
                  onClick: (): void => handlePresetClick(validFromInputId, +time ? time : null),
                  $selected:
                    presetSelected[validFromInputId]?.time === time ||
                    (time == '0' && !presetSelected[validFromInputId]?.time),
                }

                return (
                  <TimePickerPreset
                    key={time}
                    disabled={isDisabled}
                    name={validFromInputId}
                    ref={register}
                    tabIndex={tabIndex}
                    type="button"
                    {...props}
                  >
                    {formatOrderValidityTimes(+time!, 'Now')}
                  </TimePickerPreset>
                )
              })}
              <DateTimePickerControl
                control={control}
                formValues={{
                  value: validFromInputValue ? batchIdToDate(Number(validFromInputValue)).toString() : null,
                  setValue,
                  errors: validFromError,
                  inputName: validFromInputId,
                }}
                customOnChange={(e): void =>
                  handlePresetClick(validFromInputId, makeMultipleOf(5, dateToBatchId(e!)).toString(), true)
                }
              />
            </DateTimePickerWrapper>
          </OrderValidityBox>
          <OrderValidityBox>
            <p>Order expires:</p>
            <DateTimePickerWrapper $customDateSelected={presetSelected[validUntilInputId]?.isCustomTime}>
              {ORDER_EXPIRE_PRESETS.map(time => {
                const props = {
                  onClick: (): void => handlePresetClick(validUntilInputId, +time ? time : null),
                  $selected:
                    presetSelected[validUntilInputId]?.time === time ||
                    (time == '0' && !presetSelected[validUntilInputId]?.time),
                }

                return (
                  <TimePickerPreset
                    key={time}
                    disabled={isDisabled}
                    name={validUntilInputId}
                    ref={register}
                    tabIndex={tabIndex}
                    type="button"
                    {...props}
                  >
                    {formatOrderValidityTimes(+time!, 'Never')}
                  </TimePickerPreset>
                )
              })}
              <DateTimePickerControl
                control={control}
                formValues={{
                  value: validUntilInputValue ? batchIdToDate(Number(validUntilInputValue)).toString() : null,
                  setValue,
                  errors: validUntilError,
                  inputName: validUntilInputId,
                }}
                customOnChange={(e): void =>
                  handlePresetClick(validUntilInputId, makeMultipleOf(5, dateToBatchId(e!)).toString(), true)
                }
              />
            </DateTimePickerWrapper>
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
