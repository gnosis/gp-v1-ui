/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, Dispatch, SetStateAction, useEffect, useMemo } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'

// assets
import cog from 'assets/img/cog.svg'

// utils, const
import { formatDistanceStrict, dateToBatchId, batchIdToDate, formatDate } from 'utils'
import { MEDIA, BATCH_TIME_IN_MS } from 'const'

// components
import { HelpTooltipContainer, HelpTooltip } from 'components/Tooltip'
import { DateTimePickerBase, DateTimePickerWrapper } from 'components/TimePicker'

// TradeWidget: subcomponents
import { TradeFormTokenId, TradeFormData } from 'components/TradeWidget'

// hooks
import useSafeState from 'hooks/useSafeState'
import { DevdocTooltip, BatchNumberWithHelp } from 'components/Layout/Header'

const VALID_UNTIL_DEFAULT: number | null = 1440
const VALID_FROM_DEFAULT: number | null = null
// now, 30min, 60min, 24h
const ORDER_START_PRESETS = [null, 30, 60, 1440]
// 5min, 30min, 24h, 7d
const ORDER_EXPIRE_PRESETS = [5, 30, 1440, 10080, null]

const relativeMinutesToDateMS = (minutes: number): number => Date.now() + minutes * 60000

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
        grid-template-columns: 9rem auto;
        width: 100%;

        > b {
          color: #218dff;
          margin: 0 0.4rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          > .BatchNumberWrapper {
            color: var(--color-text-primary);
            font-weight: 400;
          }
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
  width: 94%;
  margin: auto;
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
  height: 36rem;
  padding: 0 0 2.4rem;
  border-radius: 0.8rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: flex-start;
  align-content: flex-start;

  @media ${MEDIA.mobile} {
    height: 42rem;
  }

  @media ${MEDIA.xSmallDown} {
    height: 52rem;
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

    ${OrderValidityBox} {
      padding: 0 0.8rem;

      @media ${MEDIA.mobile} {
        padding: 0 1.6rem;
      }

      > ${DateTimePickerWrapper} {
        padding: 0 1rem 1rem;

        > ${TimePickerPreset} {
          height: 3.8rem;
          margin: 0.6rem;
        }

        > .MuiFormControl-root {
          margin: 0 0 0.6rem 0.6rem;
        }

        > ${TimePickerPreset}, .MuiFormControl-root {
          flex: 1 1 8rem;
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
    margin: 0 auto;
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

  const [validFromButton, setValidFromButton] = useSafeState<number | null>(isAsap ? null : VALID_FROM_DEFAULT)
  const [validFromCustomTime, setValidFromCustomTime] = useSafeState<number | null>(null)
  const [validUntilButton, setValidUntilButton] = useSafeState<number | null>(isUnlimited ? null : VALID_UNTIL_DEFAULT)
  const [validUntilCustomTime, setValidUntilCustomTime] = useSafeState<number | null>(null)

  function handleRelativeTimeSelect(inputId: string, relativeTime: number | null): void {
    const relativeTimeToDate = relativeTime ? relativeMinutesToDateMS(relativeTime) : null

    if (inputId === validFromInputId) {
      batchedUpdates(() => {
        setValidFromButton(relativeTime)
        setValidFromCustomTime(relativeTimeToDate)
      })
    } else {
      batchedUpdates(() => {
        setValidUntilButton(relativeTime)
        setValidUntilCustomTime(relativeTimeToDate)
      })
    }
  }

  function handleCustomTimeSelect(inputId: string, time: number | null): void {
    if (inputId === validFromInputId) {
      batchedUpdates(() => {
        setValidFromCustomTime(time)
        setValidFromButton(Infinity)
      })
    } else {
      batchedUpdates(() => {
        setValidUntilCustomTime(time)
        setValidUntilButton(Infinity)
      })
    }
  }

  useEffect(() => {
    if (validFromCustomTime && validUntilButton && validUntilButton !== Infinity) {
      const adjustedValidUntilTime = validFromCustomTime + validUntilButton * 60 * 1000
      setValidUntilCustomTime(adjustedValidUntilTime)
    }
  }, [setValidUntilCustomTime, validFromCustomTime, validUntilButton])

  const formMethods = useFormContext<TradeFormData>()
  const { setValue, errors, register, getValues } = formMethods
  const { validFrom: validFromBatchId, validUntil: validUntilBatchId } = getValues()

  const validFromError = errors[validFromInputId]
  const validUntilError = errors[validUntilInputId]
  // const validFromInputValue = watch(validFromInputId)
  // const validUntilInputValue = watch(validUntilInputId)

  const handleShowConfig = useCallback((): void => {
    if (showOrderConfig) {
      setValue(
        validUntilInputId,
        validUntilCustomTime ? dateToBatchId(new Date(validUntilCustomTime)).toString() : null,
        {
          shouldValidate: true,
        },
      )
      setValue(validFromInputId, validFromCustomTime ? dateToBatchId(new Date(validFromCustomTime)).toString() : null, {
        shouldValidate: true,
      })
    }
    setShowOrderConfig(showOrderConfig => !showOrderConfig)
  }, [
    showOrderConfig,
    setShowOrderConfig,
    setValue,
    validUntilInputId,
    validUntilCustomTime,
    validFromInputId,
    validFromCustomTime,
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

  const validFromDisplayTime = useMemo(
    () =>
      validFromBatchId && !!+validFromBatchId
        ? getNumberOfBatchesLeftUntilNow(+validFromBatchId) > 3
          ? `${formatDate(batchIdToDate(+validFromBatchId), 'yyyy.MM.dd HH:mm')}`
          : 'NULL'
        : 'Now',
    [validFromBatchId],
  )

  const validUntilDisplayTime = useMemo(
    () =>
      validUntilBatchId && !!+validUntilBatchId
        ? formatDistanceStrict(
            batchIdToDate(+validUntilBatchId),
            validFromBatchId ? batchIdToDate(+validFromBatchId) : Date.now(),
            { addSuffix: true },
          )
        : 'Never',
    [validUntilBatchId, validFromBatchId],
  )

  return (
    <Wrapper>
      <div>
        <div>
          <div>
            Order starts:{' '}
            <b title={validFromDisplayTime}>
              {' '}
              {validFromDisplayTime}
              {!validFromBatchId ? (
                <HelpTooltip tooltip={OrderStartsTooltip} />
              ) : (
                <BatchNumberWithHelp title="&nbsp;- batch:" />
              )}
            </b>
          </div>
          <div>
            Order expires: <b title={validUntilDisplayTime}>{validUntilDisplayTime}</b>
          </div>
        </div>
        <button type="button" tabIndex={tabIndex} onClick={handleShowConfig} />
      </div>

      <OrderValidityInputsWrapper $visible={showOrderConfig} onKeyPress={onModalEnter}>
        <h4>
          Order settings <i onClick={(): void => setShowOrderConfig(!showOrderConfig)}>×</i>
        </h4>
        <div>
          <OrderValidityBox>
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
            </p>
            <DateTimePickerWrapper $customDateSelected={validFromButton === Infinity}>
              {ORDER_START_PRESETS.map(time => (
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
              <DateTimePickerBase
                value={validFromCustomTime}
                error={validFromError}
                inputName={validFromInputId}
                maxDateTime={validUntilButton === Infinity ? validUntilCustomTime! - BATCH_TIME_IN_MS : null}
                onChange={(e?: Date | string): void =>
                  handleCustomTimeSelect(validFromInputId, e ? Date.parse(e.toString()) : null)
                }
              />
            </DateTimePickerWrapper>
          </OrderValidityBox>
          <OrderValidityBox>
            <p>
              <strong>Expire Time</strong>
            </p>
            <DateTimePickerWrapper $customDateSelected={validUntilButton === Infinity}>
              {ORDER_EXPIRE_PRESETS.map(time => (
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
                onChange={(e?: Date | string): void =>
                  handleCustomTimeSelect(validUntilInputId, e ? Date.parse(e.toString()) : null)
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
