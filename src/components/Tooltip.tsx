import React, { ReactNode, CSSProperties, useCallback } from 'react'
import { State, Placement } from '@popperjs/core'
import styled from 'styled-components'
import { isElement, isFragment } from 'react-is'

// assets
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

// components
import Portal from 'components/Portal'

// hooks
import { usePopperOnClick, usePopperDefault, TOOLTIP_OFFSET } from 'hooks/usePopper'

// visibility necessary for correct boundingRect calculation by popper
const TooltipOuter = styled.div<Pick<TooltipBaseProps, 'isShown'>>`
  visibility: ${(props): 'hidden' | false => !props.isShown && 'hidden'};
`
// can style anything but TOOLTIP_OFFSET fields, position and transform: rotate
const TooltipArrow = styled.div<{ $bgColor?: string }>`
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
    background: ${({ $bgColor = 'var(--color-background-nav-active)' }): string => $bgColor};
  }
`

const TooltipInner = styled.div<{ $bgColor?: string }>`
  background: ${({ $bgColor = 'var(--color-background-nav-active)' }): string => $bgColor};
  color: var(--color-text-primary);
  font-weight: var(--font-weight-normal);
  padding: 0.8rem 1rem;
  font-size: 1.2rem;
  border-radius: 0.6rem;
  letter-spacing: 0.03rem;
  z-index: 9999;
  line-height: 1.4;

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
  bgColor?: string
  isShown: boolean
  state: Partial<Pick<State, 'placement' | 'styles'>>
}

const TooltipBase: React.ForwardRefRenderFunction<HTMLDivElement, TooltipBaseProps> = (
  { children, isShown, bgColor, state },
  ref,
) => {
  const { placement, styles = {} } = state

  return (
    // Portal isolates popup styles from the App styles
    <Portal>
      <TooltipOuter isShown={isShown} onClick={(e): void => e.stopPropagation()}>
        <TooltipInner
          role="tooltip"
          ref={ref}
          style={styles.popper as CSSProperties}
          data-popper-placement={placement}
          $bgColor={bgColor}
        >
          <TooltipArrow data-popper-arrow style={styles.arrow as CSSProperties} $bgColor={bgColor} />
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

interface WrapperProps<C> {
  tooltip: ReactNode
  placement?: Placement
  offset?: number
  focus?: boolean
  hover?: boolean
  as?: C
}

type WrapperPropsAll<T extends keyof JSX.IntrinsicElements | React.ComponentType = 'div'> = WrapperProps<T> &
  React.ComponentProps<T>

// can be used as
// <Wrapper tooltip={}><button type="button" onClick={handler}/></Wrapper>
// <Wrapper as="button" type="button" onClick={handler} tooltip={}><span/></Wrapper>
// <Wrapper tooltip={} focus={false}><input onFocus={special_handler}/></Wrapper> --> don't touch onFocus
// single child component gets cloned and ref assigned
// <Wrapper onClick={handler} tooltip={}><button type="button"/><span/></Wrapper>
// multiple children get wrapped in div
const Wrapper = <C extends keyof JSX.IntrinsicElements | React.ComponentType = 'div'>({
  children,
  tooltip,
  placement,
  as,
  focus = true,
  hover = true,
  offset,
  ...props
}: WrapperPropsAll<C> & { children?: ReactNode }): React.ReactElement => {
  const { targetProps, tooltipProps } = usePopperDefault<HTMLDivElement>(placement, offset)

  const childrenNumber = React.Children.count(children)

  // can attach ref to element
  // if children is a single element, not just text, and `as` tag|Component not specified
  if (childrenNumber === 1 && typeof as === 'undefined' && isElement(children) && !isFragment(children)) {
    let finalTargetProps:
      | typeof targetProps
      | Omit<typeof targetProps, 'onMouseEnter' | 'onMouseLeave'>
      | Omit<typeof targetProps, 'onFocus' | 'onBlur'>
      | Record<string, unknown> = {}
    if (focus && hover) {
      // pass all targetProps by default
      finalTargetProps = targetProps
    } else if (focus) {
      // <TooltipWrapper hover={false}> --> only show tooltip on focus
      finalTargetProps = {
        onFocus: targetProps.onFocus,
        onBlur: targetProps.onBlur,
        ref: targetProps.ref,
      }
    } else if (hover) {
      // <TooltipWrapper focus={false}> --> only show tooltip on hover
      // useful when onFocus is already taken
      // in that case may be better to use the hook and compose onFocus handler
      finalTargetProps = {
        onMouseEnter: targetProps.onMouseEnter,
        onMouseLeave: targetProps.onMouseLeave,
        ref: targetProps.ref,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TargetComponent = (as || 'div') as keyof JSX.IntrinsicElements | React.ComponentType<any>

  return (
    // extra props on <TooltipWrapper {...props}/> get passed onto TargteComponent
    <TargetComponent {...targetProps} {...props}>
      {children}
      <Tooltip {...tooltipProps}>{tooltip}</Tooltip>
    </TargetComponent>
  )
}

export const TooltipWrapper = (React.memo(Wrapper) as unknown) as typeof Wrapper

export const LongTooltipContainer = styled.div`
  max-width: 30rem;
  line-height: 1.4;
`

interface HelpTooltipProps {
  tooltip: ReactNode
  placement?: Placement
  offset?: number
  iconSize?: FontAwesomeIconProps['size']
}

const HelperSpan = styled.span`
  cursor: pointer;
  transition: color 0.1s;

  :hover {
    color: #748a47;
  }
`

export const HelpTooltipContainer = styled(LongTooltipContainer)`
  font-size: 1.6rem;
  font-family: monospace;
  padding: 1em;
  color: black;
`

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ tooltip, placement = 'top', offset, iconSize }) => {
  const {
    targetProps: { ref, onClick },
    tooltipProps,
  } = usePopperOnClick<HTMLSpanElement>(placement, offset)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation()
      onClick()
    },
    [onClick],
  )

  return (
    <>
      <HelperSpan ref={ref} onClick={handleClick}>
        <FontAwesomeIcon icon={faQuestionCircle} size={iconSize} />
      </HelperSpan>
      <Tooltip {...tooltipProps} bgColor="#bfd6ef">
        {tooltip}
      </Tooltip>
    </>
  )
}
