import React from 'react'
import styled from 'styled-components'
import { BaseDateTimePickerProps, DateTimePickerProps, MobileDateTimePicker } from '@material-ui/pickers'
import { TextField } from '@material-ui/core'
import DateFnsAdapter from '@material-ui/pickers/adapter/date-fns'
import { Control, UseFormMethods, FieldError, Controller } from 'react-hook-form'

import { TradeFormData } from './TradeWidget'
import { BATCH_TIME, BATCH_TIME_IN_MS } from 'const'
import { GlobalStyles } from './TimePicker/TimePicker.styled'

interface DateTimePickerBase extends Omit<DateTimePickerProps, 'renderInput'> {
  error?: FieldError
  customOnChange?: (date: Date, keyboardInputValue?: string | undefined) => void
  inputName: string
}

interface DateTimePickerControlProps<T> extends DateTimePickerBase, BaseDateTimePickerProps {
  control: Control<T>
  formValues: {
    value: string | null
    setValue: UseFormMethods['setValue']
    errors?: FieldError
    inputName: keyof T
  }
}

const DateTimePickerBase: React.FC<DateTimePickerBase> = ({
  error,
  inputName,
  minDateTime = Date.now() + BATCH_TIME_IN_MS * 2,
  // customOnChange,
  ...restProps
}) => {
  const memoizedDateAdapter = React.useMemo(() => {
    return new DateFnsAdapter()
  }, [])

  return (
    <>
      <GlobalStyles />
      <MobileDateTimePicker
        {...restProps}
        dateAdapter={memoizedDateAdapter}
        disablePast
        minutesStep={BATCH_TIME / 60}
        // inputFormat="yyyy/MM/dd HH:mm"
        ampm={false}
        minDateTime={minDateTime}
        renderInput={(props): JSX.Element => (
          <TextField {...props} label="Set custom date" name={inputName} error={!!error} />
        )}
      />
    </>
  )
}

const DateTimePickerControl: React.FC<DateTimePickerControlProps<TradeFormData>> = ({
  control,
  formValues,
  customOnChange,
  ...restProps
}) => {
  const currentError = formValues.errors
  return (
    <Controller
      control={control}
      name={formValues.inputName}
      render={(): JSX.Element => (
        <DateTimePickerBase
          {...restProps}
          error={currentError}
          inputName={formValues.inputName}
          customOnChange={customOnChange}
        />
      )}
    />
  )
}

const DateTimePickerWrapper = styled.div<{ $customDateSelected?: boolean }>`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  height: auto;

  > .MuiFormControl-root,
  .MuiTextField-root {
    min-width: max-content;
  }

  > .MuiFormControl-root {
    > .MuiInputBase-root,
    > .MuiInputLabel-formControl {
      color: inherit;
      font-weight: inherit;
      text-align: center;
    }

    > .MuiInput-underline {
      &:before {
        border-color: var(--color-background-button-hover);
      }
      &:after {
        border-color: transparent;
      }
    }
  }

  ${({ $customDateSelected = false }): string | false =>
    $customDateSelected &&
    `
      > .MuiFormControl-root {
        // when selected only
        background: var(--color-background-validation-warning);
        padding: 0.6rem 0.6rem 0 0.6rem;
        border-bottom: 0.3rem solid var(--color-background-CTA);

        

        > .MuiInputLabel-formControl {
          // only when selected
          top: 0.6rem;
          left: 0.6rem;

        }

        > .MuiInput-formControl {
          margin-top: 1.35rem !important;
          
          > input {
            font-weight: bold;
          }
        }

        > .MuiInput-underline:before, > .MuiInput-underline:after {
          // when selected only
          content: none;
        }
      }
  `}
`

export { DateTimePickerWrapper, DateTimePickerControl, DateTimePickerBase }
