// This lib does not yet provide a type declaration.
// See for progress https://github.com/upmostly/modali/issues/9

declare module 'modali' {
  export interface ModalProps {
    isShown: boolean
    hide: () => void
    options: ModalOptions
  }
  export interface ModalOptions {
    title?: string
    message?: string
    buttons?: array
    closeButton?: boolean
    animated?: boolean
    large?: boolean
    overlayClose?: boolean
    keyboardClose?: boolean
  }

  export interface ButtonProps {
    label?: string
    isStyleDefault?: string
    isStyleCancel?: string
    isStyleDestructive?: string
    onClick?: Function
  }

  export function useModali(ModalOptions?): [ModalProps, () => void]
  export const Modal: FC<ModalProps>
  export const Button: FC<ButtonProps>
}
