import React, { ReactNode, CSSProperties } from 'react'
import Portal from './Portal'
import { usePopperDefault } from 'hooks/usePopper'
import { State, Placement } from '@popperjs/core'

interface TooltipBaseProps {
  isShown: boolean
  state: Partial<Pick<State, 'placement' | 'styles'>>
}

const TooltipBase: React.FC<TooltipProps> = ({ children, isShown, state }, ref) => {
  const { placement, styles = {} } = state

  return (
    // Portal isolates popup styles from the App styles
    <Portal>
      <div style={isShown ? undefined : { visibility: 'hidden' }}>
        <div
          className="tooltip"
          role="tooltip"
          ref={ref}
          style={styles.popper as CSSProperties}
          data-popper-placement={placement}
        >
          <div className="arrow" data-popper-arrow style={styles.arrow as CSSProperties} />
          {isShown && children}
        </div>
      </div>
    </Portal>
  )
}

interface TooltipProps extends TooltipBaseProps {
  children?: ReactNode
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(TooltipBase)

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
