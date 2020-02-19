import React, { ReactNode, CSSProperties } from 'react'
import Portal from './Portal'
import { usePopperDefault, TOOLTIP_OFFSET } from 'hooks/usePopper'
import { State, Placement } from '@popperjs/core'
import styled, { StyledComponent, StyledComponentProps } from 'styled-components'
import { isElement, isFragment } from 'react-is'

// visibility necessary for correct boundingRect calculation by popper
const TooltipOuter = styled.div<Pick<TooltipBaseProps, 'isShown'>>`
  visibility: ${(props): 'hidden' | false => !props.isShown && 'hidden'};
`
// can style anything but TOOLTIP_OFFSET fields, position and transform: rotate
const TooltipArrow = styled.div`
  &,
  ::before {
    position: absolute;
    width: ${TOOLTIP_OFFSET}px;
    height: ${TOOLTIP_OFFSET}px;
    z-index: -1;
  }

  ::before {
    content: '';
    transform: rotate(45deg);
    background: #333;
  }
`

const TooltipInner = styled.div`
  background: #333;
  color: white;
  font-weight: bold;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 4px;

  &[data-popper-placement^='top'] > ${TooltipArrow} {
    bottom: -${TOOLTIP_OFFSET / 2}px;
  }

  &[data-popper-placement^='bottom'] > ${TooltipArrow} {
    top: -${TOOLTIP_OFFSET / 2}px;
  }

  &[data-popper-placement^='left'] > ${TooltipArrow} {
    right: -${TOOLTIP_OFFSET / 2}px;
  }

  &[data-popper-placement^='right'] > ${TooltipArrow} {
    left: -${TOOLTIP_OFFSET / 2}px;
  }
`

interface TooltipBaseProps {
  isShown: boolean
  state: Partial<Pick<State, 'placement' | 'styles'>>
}

const TooltipBase: React.FC<TooltipBaseProps> = ({ children, isShown, state }, ref) => {
  const { placement, styles = {} } = state

  return (
    // Portal isolates popup styles from the App styles
    <Portal>
      <TooltipOuter isShown={isShown}>
        <TooltipInner role="tooltip" ref={ref} style={styles.popper as CSSProperties} data-popper-placement={placement}>
          <TooltipArrow data-popper-arrow style={styles.arrow as CSSProperties} />
          {isShown && children}
        </TooltipInner>
      </TooltipOuter>
    </Portal>
  )
}

interface TooltipProps extends TooltipBaseProps {
  children?: ReactNode
}

export const Tooltip = React.memo(React.forwardRef<HTMLDivElement, TooltipProps>(TooltipBase))

interface WrapperProps {
  tooltip: ReactNode
  placement?: Placement
  focus?: boolean
  hover?: boolean
}

// using StyledComponent type since it properly types as={Component}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Wrapper: StyledComponent<'div', any, WrapperProps> = (({
  children,
  tooltip,
  placement,
  as,
  focus = true,
  hover = true,
  ...props
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
WrapperProps & StyledComponentProps<'div', any, {}, any>): any => {
  const { targetProps, tooltipProps } = usePopperDefault<HTMLDivElement>(placement)

  const chilrenNumber = React.Children.count(children)

  // can attach ref to element
  // if children is a single element, not just text, and `as` tag|Component not specified
  if (chilrenNumber === 1 && typeof as === 'undefined' && isElement(children) && !isFragment(children)) {
    let finalTargetProps
    if (focus && hover) {
      // pass all targetProps by default
      finalTargetProps = targetProps
    } else if (focus) {
      // <TooltipWrapper hover={false}> --> only show tooltip on focus
      finalTargetProps = {
        onFocus: targetProps.onFocus,
        onBlur: targetProps.onBlur,
      }
    } else if (hover) {
      // <TooltipWrapper focus={false}> --> only show tooltip on hover
      // useful when onFocus is already taken
      // in that case may be better to use the hook and compose onFocus handler
      finalTargetProps = {
        onMouseEnter: targetProps.onMouseEnter,
        onMouseLeave: targetProps.onMouseLeave,
      }
    }
    const TargetComponent = React.cloneElement(children, finalTargetProps)
    return (
      <>
        {TargetComponent}
        <Tooltip {...tooltipProps}>{tooltip}</Tooltip>
      </>
    )
  }

  //  if as not provided and can't clone single element
  //  use div
  const TargetComponent = as || 'div'

  return (
    <TargetComponent {...targetProps} {...props}>
      {children}
      <Tooltip {...tooltipProps}>{tooltip}</Tooltip>
    </TargetComponent>
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as StyledComponent<'div', any, WrapperProps>

export const TooltipWrapper = (React.memo(Wrapper) as unknown) as typeof Wrapper
