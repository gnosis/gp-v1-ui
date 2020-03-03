import React, { ReactNode, useMemo } from 'react'
import { usePopperDefault } from 'hooks/usePopper'
import { Placement } from '@popperjs/core'
import { Tooltip } from 'components/Tooltip'
import styled from 'styled-components'

interface InputProps extends Partial<React.ComponentPropsWithRef<'input'>> {
  tooltip: ReactNode
  showErrorStyle?: boolean
  placement?: Placement
}

type TargetProps = Pick<
  React.ComponentPropsWithRef<'input'>,
  'onBlur' | 'onFocus' | 'onMouseEnter' | 'onMouseLeave' | 'ref'
>

const Input = styled.input<{ $error?: boolean }>`
  box-shadow: ${({ $error }): string => ($error ? '0px 0px 1.7px 0.4px #f24949' : '')};
  &:focus {
    border-color: ${({ $error }): string => ($error ? '#f24949 !important' : 'initial')};
  }
`

const InputWithTooltip: React.RefForwardingComponent<HTMLInputElement, InputProps> = (
  { tooltip, placement, onFocus, onBlur, onMouseEnter, onMouseLeave, showErrorStyle, ...props },
  ref,
) => {
  const { targetProps, tooltipProps } = usePopperDefault<HTMLInputElement>(placement)

  // compose input event handlers and ref with props form usePopper
  // that way both tooltips and form logic can function together
  const finalTargetProps = useMemo<TargetProps>(() => {
    const composedProps: TargetProps = {}
    composedProps.onBlur = onBlur
      ? (event): void => {
          console.log('event', event.currentTarget)
          onBlur(event)
          targetProps.onBlur()
        }
      : targetProps.onBlur
    composedProps.onFocus = onFocus
      ? (event): void => {
          onFocus(event)
          targetProps.onFocus()
        }
      : targetProps.onFocus
    composedProps.onMouseEnter = onMouseEnter
      ? (event): void => {
          onMouseEnter(event)
          targetProps.onMouseEnter()
        }
      : targetProps.onMouseEnter
    composedProps.onMouseLeave = onMouseLeave
      ? (event): void => {
          onMouseLeave(event)
          targetProps.onMouseLeave()
        }
      : targetProps.onMouseLeave

    composedProps.ref = ref
      ? (element: HTMLInputElement): void => {
          if ('current' in ref) {
            ;(ref as React.MutableRefObject<HTMLInputElement>).current = element
          } else if (typeof ref === 'function') {
            ref(element)
          }
          ;(targetProps.ref as React.MutableRefObject<HTMLInputElement>).current = element
        }
      : targetProps.ref

    return composedProps
  }, [onBlur, onFocus, onMouseEnter, onMouseLeave, ref, targetProps])

  return (
    <>
      <Input $error={showErrorStyle} {...props} {...finalTargetProps} />
      <Tooltip {...tooltipProps}>{tooltip}</Tooltip>
    </>
  )
}

export default React.forwardRef<HTMLInputElement, InputProps>(InputWithTooltip)
