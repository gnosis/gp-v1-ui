import React, { ReactNode, CSSProperties } from 'react'
import Portal from './Portal'
import { usePopperDefault, TOOLTIP_OFFSET } from 'hooks/usePopper'
import { State, Placement } from '@popperjs/core'
import styled from 'styled-components'

const TooltipOuter = styled.div<Pick<TooltipBaseProps, 'isShown'>>`
  visibility: ${(props): string | false => !props.isShown && 'hidden'};
`

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
}

export const TooltipWrapper: React.FC<WrapperProps> = ({ children, tooltip, placement }) => {
  const { targetProps, tooltipProps } = usePopperDefault<HTMLDivElement>(placement)

  return (
    <div {...targetProps}>
      {children}
      <Tooltip {...tooltipProps}>{tooltip}</Tooltip>
    </div>
  )
}

interface MemoizedWrapperProps extends WrapperProps {
  children?: ReactNode
}

export const TooltipWrapper = React.memo<MemoizedWrapperProps>(Wrapper)
