import React, { useMemo } from 'react'
import styled from 'styled-components'
import { formatSchemaErrorMessage } from 'utils'

export const FormMessageWrapper = styled.div<{ $margin?: string; $padding?: string }>`
  margin: ${({ $margin = '0' }): string => $margin};
  padding: ${({ $padding = '0' }): string => $padding};
`

const FormMessage = styled.div.attrs<{ className?: string }>(props => ({
  className: props.className ? undefined : 'error',
}))`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: inherit;
  margin: 0 0 0 0.3rem;
  color: #476481;
  width: 100%;

  > a {
    color: #218dff;
    margin: 0 0 0 0.3rem;
  }

  .success {
    color: green;
    text-decoration: none;
  }

  &.error,
  &.warning {
    > strong {
      color: inherit;
    }
  }

  &.error {
    color: red;
  }
  &.warning {
    color: #476481;
    background: #fff0eb;
    border-radius: 0 0 0.3rem 0.3rem;
    padding: 0.5rem;
    box-sizing: border-box;
    margin: 0.3rem 0 1rem;
  }
  &.hidden {
    visibility: hidden;
  }
`

interface FormInputErrorProps {
  errorMessage?: string
  schemaError?: boolean
  visibilityHidden?: boolean
  wrapperMargin?: string
}

export const FormInputError: React.FC<FormInputErrorProps> = ({
  errorMessage,
  schemaError = true,
  visibilityHidden = true,
  wrapperMargin = '0.5rem 0',
}) => {
  const message = useMemo(() => {
    if (errorMessage) {
      if (schemaError) {
        return formatSchemaErrorMessage(errorMessage)
      }

      return errorMessage
    } else {
      if (visibilityHidden) {
        return 'Stop using developer tools! :D'
      }

      return null
    }
  }, [errorMessage, schemaError, visibilityHidden])

  return (
    <FormMessageWrapper $margin={wrapperMargin}>
      <FormMessage className={errorMessage ? 'error' : 'hidden'}>{message}</FormMessage>
    </FormMessageWrapper>
  )
}

export default FormMessage
