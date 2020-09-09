/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, Dispatch, SetStateAction, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useFormContext, useWatch } from 'react-hook-form'

// assets
import cog from 'assets/img/cog.svg'

// utils, const
import {
  formatDistanceStrict,
  dateToBatchId,
  formatDateLocaleShortTime,
  formatSeconds,
  roundToNearestMinutes,
  addMinutes,
  addYears,
} from 'utils'
import { MEDIA, BATCH_TIME_IN_MS } from 'const'

// components
import { HelpTooltipContainer, HelpTooltip } from 'components/Tooltip'
import { DateTimePickerBase, DateTimePickerWrapper } from 'components/TimePicker'
import { InputContainer } from 'components/Settings/WalletConnect'
import { Input } from 'components/Input'
import InputBox from 'components/InputBox'
import { StrongSubHeader } from 'components/SectionHeaders'

// TradeWidget: subcomponents
import { TradeFormTokenId, TradeFormData, DEFAULT_FORM_STATE } from 'components/TradeWidget'
import { FormInputError } from 'components/common/FormInputError'
import { FormMessage } from 'components/common/FormMessage'

// hooks
import useSafeState from 'hooks/useSafeState'
import { DevdocTooltip, BatchNumberWithHelp } from 'components/Layout/Header'
import { useTimeRemainingInBatch } from 'hooks/useTimeRemainingInBatch'
import useNoScroll from 'hooks/useNoScroll'

import { validitySchema, BATCH_START_THRESHOLD, BATCH_END_THRESHOLD } from './validationSchema'

// now, 30min, 60min, 24h
const ORDER_START_PRESETS = [null, 30, 60, 1440]
// 5min, 30min, 24h, 7d
const ORDER_EXPIRE_PRESETS = [30, 1440, 10080, null]
const VALID_UNTIL_RELATIVE_DEFAULT = ORDER_EXPIRE_PRESETS[3]
const VALID_FROM_RELATIVE_DEFAULT = ORDER_START_PRESETS[0]

const relativeMinutesToDateMS = (minutes: number): number =>
  roundToNearestMinutes(addMinutes(Date.now(), minutes), { nearestTo: 5 }).getTime()

export function getNumberOfBatchesLeftUntilNow(batchId: number): number {
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
  margin: 1rem 0;
  width: 100%;
  flex-flow: column nowrap;
  border-bottom: 0.1rem solid var(--color-background-banner);

  > div.innerWrapper {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 0.8rem;

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
      width: calc(100% - 8rem);

      @media ${MEDIA.xSmallDown} {
        width: min-content;
      }

      > div {
        display: grid;
        grid-template-columns: 7.8rem auto;
        width: 100%;
        font-size: 1.2rem;

        > b {
          color: #218dff;
          cursor: pointer;
          margin: 0 0.4rem;
          min-width: 12rem;

          // tooltip svg
          > span {
            font-size: 1.25rem;
            color: var(--color-text-primary);
          }

          > .BatchNumberWrapper {
            color: var(--color-text-primary);
            font-weight: 400;
            margin: 0 0 0 0.3rem;
          }
        }
      }
    }

    > a {
      color: rgb(33, 141, 255);
      font-size: 1.2rem;

      @media ${MEDIA.xSmallDown} {
        display: none;
      }
    }

    > button {
      display: none;
      content: '';
      background: url(${cog}) no-repeat center/contain;
      width: 1.8rem;
      height: 1.8rem;
      margin-left: auto;
      opacity: 1;

      @media ${MEDIA.xSmallDown} {
        display: block;
      }
    }
  }
`

const OrderValidityBox = styled.div`
  width: 94%;
  margin: 1rem auto;
  padding: 0.3rem 1.6rem;
  border-radius: var(--border-radius);

  &.error {
    background: #ffd8d6;
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

  ${({ $selected = false }): string | false =>
    $selected &&
    `{
    background: var(--color-background-balance-button-hover);
    color: var(--color-text-button-hover);
  }`}

  &:focus {
    border-color: var(--color-background-CTA);
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
  max-width: 72rem;
  min-width: 30rem;
  height: 54.5rem;
  padding: 0 0 2.4rem;
  border-radius: 0.8rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: flex-start;
  align-content: flex-start;

  @media ${MEDIA.mobile} {
    height: 76%;
  }

  @media ${MEDIA.xSmallDown} {
    height: 100%;
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
    height: calc(100% - 8.8rem);
    overflow-y: auto;
    padding-bottom: 1rem;

    ${FormMessage} {
      justify-content: flex-start;
      padding: 0.2rem 2rem;
      margin: 0;
    }

    ${OrderValidityBox} {
      > ${DateTimePickerWrapper} {
        padding: 0 1rem 1rem;

        > ${InputContainer}, > .MuiFormControl-root {
          margin: 0.6rem;
          height: 5.6rem;
        }

        > ${InputContainer} {
          > div {
            height: 100%;
            margin: 0;

            > small.inputLabel {
              top: 40%;
            }

            > input.movingLabel {
              padding: 0.2rem 1rem 0 5.6rem;

              &:focus {
                padding: 0.2rem 1rem 0 1rem;

                ~ small.inputLabel {
                  top: 0.5rem;
                }
              }
            }
          }
        }
        > ${TimePickerPreset} {
          height: 3.8rem;
          margin: 0.6rem;
        }

        > .MuiFormControl-root {
          border-radius: 0.6rem 0.6rem 0 0;

          > .MuiInputBase-root.MuiInput-root.MuiInput-underline.MuiInputBase-formControl.MuiInput-formControl {
            margin-top: 2.4rem;

            > input.MuiInputBase-input.MuiInput-input {
              font-size: 1.4rem;
            }
          }

          > label.MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl.MuiInputLabel-animated.MuiInputLabel-shrink.MuiFormLabel-filled {
            font-size: 1.2rem;
          }
        }

        > ${TimePickerPreset}, .MuiFormControl-root,
        ${InputContainer} {
          flex: 1 1 23%;
          font-size: 1.2rem;
        }

        @media ${MEDIA.mobile} {
          > .MuiFormControl-root,
          > ${InputContainer} {
            flex: 1 1 100%;
          }

          > ${TimePickerPreset} {
            flex: 1;
          }
        }

        @media ${MEDIA.xSmallDown} {
          > ${TimePickerPreset} {
            flex: 1 1 15rem;
          }
        }
      }

      > p {
        display: flex;
        align-items: center;
        text-transform: capitalize;
        color: var(--color-text-primary);
        height: 2.4rem;
        width: 100%;
        margin-bottom: 0;
        padding: 0;
        box-sizing: border-box;

        > strong {
          font-size: 1.5rem;
        }

        > span {
          font-family: var(--font-mono);
          font-size: 1.2rem;
          font-weight: normal;
          letter-spacing: 0;
          text-transform: none;

          > strong {
            color: var(--color-text-active);
          }

          &.resetAll {
            color: var(--color-text-active);
            margin-left: auto;
            cursor: pointer;
            text-decoration: underline;
          }
        }
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
    outline: 0;
    height: 3.6rem;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    letter-spacing: 0.03rem;
  }
`

const OrderStartsTooltip = (
  <HelpTooltipContainer>
    Orders configured to start <strong>now</strong> will be considered for the next batch. Click the ⚙️ icon on the
    right to customise order validity times.
  </HelpTooltipContainer>
)

const OrderExpiresTooltip = (
  <HelpTooltipContainer>Expiration time is always shown relative to order start time.</HelpTooltipContainer>
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
  isAsap,
  tabIndex,
  validFromInputId,
  validUntilInputId,
}) => {
  const [showOrderConfig, setShowOrderConfig] = useSafeState(false)

  const { control, setValue, errors, register, clearErrors, setError } = useFormContext<TradeFormData>()
  const { [validFromInputId]: validFromTimeMs, [validUntilInputId]: validUntilTimeMs } = useWatch({
    name: [validFromInputId, validUntilInputId],
    control,
    defaultValue: {
      [validFromInputId]: DEFAULT_FORM_STATE.validFrom,
      [validUntilInputId]: DEFAULT_FORM_STATE.validUntil,
    },
  })

  const [validFromButton, setValidFromButton] = useSafeState<number | 'CUSTOM_TIME' | null>(
    isAsap ? null : validFromTimeMs ? 'CUSTOM_TIME' : VALID_FROM_RELATIVE_DEFAULT,
  )
  const [validUntilButton, setValidUntilButton] = useSafeState<number | 'CUSTOM_TIME' | null>(
    isUnlimited ? null : validUntilTimeMs ? 'CUSTOM_TIME' : VALID_UNTIL_RELATIVE_DEFAULT,
  )
  const [validFromCustomTime, setValidFromCustomTime] = useSafeState<number | null>(
    (validFromTimeMs && +validFromTimeMs) || null,
  )
  const [validUntilCustomTime, setValidUntilCustomTime] = useSafeState<number | null>(
    (validUntilTimeMs && +validUntilTimeMs) || null,
  )
  const [validFromCustomBatchId, setValidFromCustomBatchId] = useSafeState<number | null>(
    validFromTimeMs && +validFromTimeMs ? dateToBatchId(+validFromTimeMs) : null,
  )
  const [validUntilCustomBatchId, setValidUntilCustomBatchId] = useSafeState<number | null>(
    validUntilTimeMs && +validUntilTimeMs ? dateToBatchId(+validUntilTimeMs) : null,
  )

  const validFromError = errors[validFromInputId]
  const validUntilError = errors[validUntilInputId]

  const handleRelativeTimeSelect = useCallback(
    function (inputId: string, relativeTime: number | null): void {
      const relativeTimeToDate: number | null = relativeTime ? relativeMinutesToDateMS(relativeTime) : null

      if (inputId === validFromInputId) {
        setValidFromButton(relativeTime)
        setValidFromCustomTime(relativeTimeToDate)
        setValidFromCustomBatchId(relativeTimeToDate ? dateToBatchId(relativeTimeToDate) : null)
      } else {
        setValidUntilButton(relativeTime)
        setValidUntilCustomTime(relativeTimeToDate)
        setValidUntilCustomBatchId(relativeTimeToDate ? dateToBatchId(relativeTimeToDate) : null)
      }
    },
    [
      setValidFromButton,
      setValidFromCustomBatchId,
      setValidFromCustomTime,
      setValidUntilButton,
      setValidUntilCustomBatchId,
      setValidUntilCustomTime,
      validFromInputId,
    ],
  )

  const handleCustomTimeSelect = useCallback(
    function (inputId: string, time: number | null): void {
      if (inputId === validFromInputId) {
        setValidFromCustomTime(time)
        setValidFromButton('CUSTOM_TIME')
        setValidFromCustomBatchId(dateToBatchId(time))
      } else {
        setValidUntilCustomTime(time)
        setValidUntilButton('CUSTOM_TIME')
        setValidUntilCustomBatchId(dateToBatchId(time))
      }
    },
    [
      setValidFromButton,
      setValidFromCustomBatchId,
      setValidFromCustomTime,
      setValidUntilButton,
      setValidUntilCustomBatchId,
      setValidUntilCustomTime,
      validFromInputId,
    ],
  )

  const handleValidFromBatchIdSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void =>
      handleCustomTimeSelect(validFromInputId, +e.target.value * BATCH_TIME_IN_MS),
    [handleCustomTimeSelect, validFromInputId],
  )

  const handleValidUntilBatchIdSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void =>
      handleCustomTimeSelect(validUntilInputId, +e.target.value * BATCH_TIME_IN_MS),
    [handleCustomTimeSelect, validUntilInputId],
  )

  const handleShowConfig = useCallback(async (): Promise<void> => {
    let formValid = true

    if (showOrderConfig) {
      try {
        const data = {
          [validFromInputId]: validFromCustomTime?.toString(),
          [validUntilInputId]: validUntilCustomTime?.toString(),
        }
        const validationResult = validitySchema.validate(data)

        if (validationResult.error) throw validationResult

        clearErrors([validFromInputId, validUntilInputId])
        // as ms time
        setValue(validFromInputId, data[validFromInputId] || null)
        setValue(validUntilInputId, data[validUntilInputId] || null)
      } catch (validationError) {
        formValid = false

        const {
          error: {
            details: [mainDetail],
          },
        } = validationError

        setError(mainDetail.path[0], { type: 'manual', message: mainDetail.message })
      }
    }

    formValid && setShowOrderConfig((showOrderConfig) => !showOrderConfig)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showOrderConfig,
    setShowOrderConfig,
    validFromCustomTime,
    validUntilCustomTime,
    validFromInputId,
    validUntilInputId,
    clearErrors,
    setValue,
    setError,
  ])

  const handleCancel = useCallback((): void => {
    clearErrors([validFromInputId, validUntilInputId])
    setShowOrderConfig(false)
  }, [clearErrors, setShowOrderConfig, validFromInputId, validUntilInputId])

  const handleReset = useCallback((): void => {
    clearErrors([validFromInputId, validUntilInputId])
    handleRelativeTimeSelect(validFromInputId, VALID_FROM_RELATIVE_DEFAULT)
    handleRelativeTimeSelect(validUntilInputId, VALID_UNTIL_RELATIVE_DEFAULT)
  }, [clearErrors, handleRelativeTimeSelect, validFromInputId, validUntilInputId])

  // On any errors, show form
  useEffect(() => {
    if ((validFromError || validUntilError) && !showOrderConfig) {
      setShowOrderConfig(true)
    }
  }, [validFromError, validUntilError, setShowOrderConfig, showOrderConfig])

  // check differences in batches between now and current batch
  // used below to start countdown if difference is 3 batches or less
  const timeRemainingInBatch = useTimeRemainingInBatch(
    validFromTimeMs ? getNumberOfBatchesLeftUntilNow(dateToBatchId(+validFromTimeMs)) : 1,
  )

  // Auto update validUntil when changing validFrom
  // as validUntil is always relative to validFrom
  useEffect(() => {
    if (validUntilButton) {
      let adjustedValidUntilTime: number | undefined
      const MIN_MS = 60 * 1000
      if (validFromButton) {
        // If a custom until time is chosen
        if (validUntilButton !== 'CUSTOM_TIME') {
          adjustedValidUntilTime = validFromCustomTime! + validUntilButton * MIN_MS

          // if a validUntil time is chosen but a relative validFrom time is selected
          // when a custom time is not null, neither is button
        } else if (validFromButton !== 'CUSTOM_TIME') {
          adjustedValidUntilTime = validUntilCustomTime! + validFromButton * MIN_MS
        }
      } else if (validUntilButton !== 'CUSTOM_TIME') {
        // validFromButton = NOW aka null
        adjustedValidUntilTime = Date.now() + validUntilButton * MIN_MS
      }

      adjustedValidUntilTime &&
        setValidUntilCustomTime(roundToNearestMinutes(adjustedValidUntilTime, { nearestTo: 5 }).getTime())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValidUntilCustomTime, validFromButton, validUntilButton])

  // prevent body scroll when open modal
  useNoScroll(showOrderConfig)

  const validFromDisplayTime = useMemo(
    () =>
      validFromTimeMs
        ? getNumberOfBatchesLeftUntilNow(dateToBatchId(+validFromTimeMs)) > 3
          ? formatDateLocaleShortTime(+validFromTimeMs)
          : formatSeconds(timeRemainingInBatch)
        : 'Now',
    [validFromTimeMs, timeRemainingInBatch],
  )

  const validUntilDisplayTime = useMemo(
    () =>
      validUntilTimeMs ? (
        <>
          {formatDistanceStrict(
            new Date(+validUntilTimeMs),
            validFromTimeMs ? new Date(+validFromTimeMs) : Date.now(),
            {
              addSuffix: true,
            },
          )}{' '}
          <HelpTooltip tooltip={OrderExpiresTooltip} />
        </>
      ) : (
        'Never'
      ),
    [validUntilTimeMs, validFromTimeMs],
  )

  return (
    <Wrapper>
      <StrongSubHeader>Advanced Settings</StrongSubHeader>
      <div className="innerWrapper">
        <div>
          <div>
            Order starts:{' '}
            <b onClick={handleShowConfig}>
              {' '}
              {/* Memoed valid from time */}
              {validFromDisplayTime}{' '}
              {!validFromTimeMs ? (
                // Time is NOW - show tooltip
                <HelpTooltip tooltip={OrderStartsTooltip} />
              ) : (
                // Else show BatchNumber with batch tooltip
                <BatchNumberWithHelp batchId={dateToBatchId(+validFromTimeMs)} title="batch:" />
              )}
            </b>
          </div>
          <div>
            Order expires: <b onClick={handleShowConfig}>{validUntilDisplayTime}</b>
          </div>
        </div>
        {/* <button type="button" tabIndex={tabIndex} onClick={handleShowConfig} /> */}
        <a tabIndex={tabIndex} onClick={handleShowConfig}>
          [+] Customise
        </a>
        <button tabIndex={tabIndex} onClick={handleShowConfig} />
      </div>
      {/* MODAL */}
      <OrderValidityInputsWrapper $visible={showOrderConfig}>
        <h4>
          Order settings <i onClick={handleCancel}>×</i>
        </h4>
        <div>
          <OrderValidityBox className={validFromError ? 'error' : ''}>
            <p>
              <strong>Start Time</strong>
              <span>
                {validFromCustomTime ? (
                  <>
                    &nbsp;- batch:<strong>{dateToBatchId(validFromCustomTime)}</strong>&nbsp;
                    <HelpTooltip tooltip={DevdocTooltip} />
                  </>
                ) : (
                  ': Now'
                )}
              </span>
              <span onClick={handleReset} className="resetAll">
                Reset All
              </span>
            </p>
            {/* Relative Time picker */}
            <DateTimePickerWrapper $customDateSelected={validFromButton === 'CUSTOM_TIME'}>
              {ORDER_START_PRESETS.map((time) => (
                <TimePickerPreset
                  key={time || 'now'}
                  disabled={isDisabled}
                  name={validFromInputId}
                  ref={register}
                  tabIndex={tabIndex}
                  type="button"
                  onClick={(): void => handleRelativeTimeSelect(validFromInputId, time)}
                  $selected={validFromButton === time}
                >
                  {formatOrderValidityTimes(time, 'Now')}
                </TimePickerPreset>
              ))}
              {/* Calendar Picker */}
              <DateTimePickerBase
                value={validFromCustomTime}
                error={validFromError}
                inputName={validFromInputId}
                maxDateTime={
                  // custom until time: use until time - batch threshold
                  validUntilButton === 'CUSTOM_TIME'
                    ? validUntilCustomTime! - BATCH_TIME_IN_MS
                    : // else until is NEVER: make max 1 year
                    !validUntilButton
                    ? addYears(Date.now(), 1)
                    : // else do nada brudi
                      null
                }
                onClose={(): void => {
                  if (validFromCustomTime) {
                    // if from time selected is less than now + threshold, set to minimum time
                    if (validFromCustomTime < Date.now() + BATCH_TIME_IN_MS * BATCH_START_THRESHOLD) {
                      handleCustomTimeSelect(validFromInputId, Date.now() + BATCH_TIME_IN_MS * BATCH_START_THRESHOLD)
                    }

                    // if valid until time selected and from time selected is greater or equal to valid from time
                    // set valid until to min threshold
                    if (validUntilCustomTime && validFromCustomTime >= validUntilCustomTime) {
                      handleCustomTimeSelect(validUntilInputId, validFromCustomTime + BATCH_TIME_IN_MS)
                    }
                  }
                }}
                onChange={(e?: Date | string): void => {
                  if (e) {
                    handleCustomTimeSelect(validFromInputId, Date.parse(e.toString()))
                  }
                }}
              />
              {/* BatchId input */}
              <InputContainer>
                <InputBox>
                  <Input
                    type="number"
                    className="movingLabel"
                    min={dateToBatchId() + BATCH_START_THRESHOLD}
                    max={
                      validUntilCustomBatchId
                        ? validUntilCustomBatchId - BATCH_END_THRESHOLD
                        : dateToBatchId(addYears(Date.now(), 1))
                    }
                    placeholder={(dateToBatchId() + BATCH_START_THRESHOLD).toString()}
                    step={1}
                    value={validFromCustomBatchId || undefined}
                    onChange={handleValidFromBatchIdSelect}
                  />
                  <small className="inputLabel">batch</small>
                </InputBox>
              </InputContainer>
            </DateTimePickerWrapper>
          </OrderValidityBox>
          <OrderValidityBox className={validUntilError ? 'error' : ''}>
            <p>
              <strong>Expire Time</strong>
            </p>
            <DateTimePickerWrapper $customDateSelected={validUntilButton === 'CUSTOM_TIME'}>
              {ORDER_EXPIRE_PRESETS.map((time) => (
                <TimePickerPreset
                  key={time || 'never'}
                  disabled={isDisabled}
                  name={validUntilInputId}
                  ref={register}
                  tabIndex={tabIndex}
                  type="button"
                  onClick={(): void => handleRelativeTimeSelect(validUntilInputId, time)}
                  $selected={validUntilButton === time}
                >
                  {formatOrderValidityTimes(time, 'Never')}
                </TimePickerPreset>
              ))}
              <DateTimePickerBase
                value={validUntilCustomTime}
                error={validUntilError}
                inputName={validUntilInputId}
                minDateTime={(validFromCustomTime || Date.now()) + BATCH_TIME_IN_MS}
                maxDate={addYears(Date.now(), 5)}
                onClose={(): void => {
                  // prevent choosing values in the past relative to either Date.now or chosen start date
                  if (validUntilCustomTime) {
                    if (validUntilCustomTime < Date.now() + BATCH_TIME_IN_MS * BATCH_END_THRESHOLD) {
                      handleCustomTimeSelect(validUntilInputId, Date.now() + BATCH_TIME_IN_MS * BATCH_START_THRESHOLD)
                    }

                    if (
                      validFromCustomTime &&
                      validUntilCustomTime <= validFromCustomTime + BATCH_TIME_IN_MS * BATCH_END_THRESHOLD
                    ) {
                      handleCustomTimeSelect(validUntilInputId, validFromCustomTime + BATCH_TIME_IN_MS)
                    }
                  }
                }}
                onChange={(e?: Date | string): void => {
                  if (e) {
                    handleCustomTimeSelect(validUntilInputId, Date.parse(e.toString()))
                  }
                }}
              />
              {/* BatchId input */}
              <InputContainer>
                <InputBox>
                  <Input
                    type="number"
                    className="movingLabel"
                    // Minimum time = to selected validFrom batch id or if set to now, use date now + threshold
                    min={(validFromCustomBatchId || dateToBatchId()) + BATCH_END_THRESHOLD}
                    // Maximum time = to selected validFrom batch id or date now + 5 years
                    max={dateToBatchId(addYears(validFromCustomTime || Date.now(), 5))}
                    placeholder={((validFromCustomBatchId || dateToBatchId()) + BATCH_END_THRESHOLD).toString()}
                    step={1}
                    value={validUntilCustomBatchId || undefined}
                    onChange={handleValidUntilBatchIdSelect}
                  />
                  <small className="inputLabel">batch</small>
                </InputBox>
              </InputContainer>
            </DateTimePickerWrapper>
          </OrderValidityBox>
          {validFromError && (
            <FormMessage>
              <FormInputError errorMessage={validFromError.message} />
            </FormMessage>
          )}
          {validUntilError && (
            <FormMessage>
              <FormInputError errorMessage={validUntilError.message} />
            </FormMessage>
          )}
        </div>
        <span>
          <button className="cancel" type="button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" onClick={handleShowConfig} tabIndex={tabIndex}>
            Set order parameters
          </button>
        </span>
      </OrderValidityInputsWrapper>
    </Wrapper>
  )
}

export default OrderValidity
