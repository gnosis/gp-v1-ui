import React, { useMemo } from 'react'
import styled from 'styled-components'

import { FormMessage } from 'components/atoms/FormMessage'

const Wrapper = styled.div<{ $margin?: string; $padding?: string }>`
  margin: ${({ $margin = '0' }): string => $margin};
  padding: ${({ $padding = '0' }): string => $padding};
`

export interface Props {
  errorMessage?: string
  schemaError?: boolean
  visibilityHidden?: boolean
  wrapperMargin?: string
}

export const FormInputError: React.FC<Props> = ({
  errorMessage,
  visibilityHidden = true,
  wrapperMargin = '0.5rem 0',
}) => {
  const message = useMemo(() => {
    if (errorMessage) {
      return errorMessage
    } else {
      if (visibilityHidden) {
        return 'Stop using developer tools! :D'
      }

      return null
    }
  }, [errorMessage, visibilityHidden])

  return (
    <Wrapper $margin={wrapperMargin}>
      <FormMessage className={errorMessage ? 'error' : 'hidden'}>{message}</FormMessage>
    </Wrapper>
  )
}
