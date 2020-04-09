// This lib does not yet provide a type declaration.
// See for progress https://github.com/upmostly/modali/issues/9

declare module 'modali' {
  interface Modal {
    /**
     * Controls whether the modals is visible or not. Toggled by the toggle
     * modal function returned by `useModal`, or could be externally controlled
     */
    isModalVisible: boolean

    /**
     * Hide the modal.
     */
    hide: () => void

    /**
     * Options for the modal
     */
    options: ModalOptions
  }

  export interface ModalProps extends Modal {
    children?: React.ReactNode
  }

  /**
   * An object containing props which must be passed into the Modali component.
   */
  export interface ModalHook extends Modal {
    /**
     * Telling whether the modal is visible or not.
     */
    isShown: boolean
  }

  export interface ModalOptions {
    /**
     * Called when the component finishes mounting to the DOM
     */
    onShow?: () => void

    /**
     * Called when the component is removed from the DOM
     */
    onHide?: () => void

    /**
     * Called when the escape key is pressed while the component is mounted to the DOM
     */
    onEscapeKeyDown?: () => void

    /**
     * Called when the modal overlay back is clicked while the component is mounted to the DOM
     */
    onOverlayClicked?: () => void

    /**
     * The text displayed in the upper left corner
     */
    title?: React.ReactNode

    /**
     * The text displayed in the body of the modal
     */
    message?: React.ReactNode

    /**
     * Displays whatever is passed in in the footer
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buttons?: any[]

    /**
     * Controls the visibility of the close button
     */
    closeButton?: boolean

    /**
     * Fades in the modal when it mounts to the DOM
     */
    animated?: boolean

    /**
     * Positions the modal in the center of the screen
     */
    centered?: boolean

    /**
     * Changes the size of the modal to be 800px wide
     */
    large?: boolean

    /**
     * Disables clicking the modal overlay to hide it
     */
    overlayClose?: boolean

    /**
     * Disables the ESC key hiding the modal
     */
    keyboardClose?: boolean
  }

  export interface ButtonProps {
    /**
     * String that is shown on the button
     */
    label: string

    /**
     * Pass in this prop as true to show the default button
     */
    isStyleDefault?: boolean

    /**
     * Pass in this prop as true to show a cancel button
     */
    isStyleCancel?: boolean

    /**
     * Pass in this prop as true to show a delete button
     */
    isStyleDestructive?: boolean

    /**
     * Called when the button is clicked
     */
    onClick: () => void
  }

  /**
   * Toggle visibility of the modali component
   */
  type toggleModaliComponent = () => void

  export function useModali(options?: ModalOptions): [ModalHook, toggleModaliComponent]

  /**
   * The `<Modali.Modal />` component provides a beautiful, WAI-ARIA accessible
   * modal dialog out of the box. Import it, add it to your component tree, pass
   * in the props object that you get from the useModali hook and you're all set.
   */
  export const Modal: React.FC<ModalProps>

  /**
   * The `<Modali.Button />` component provides a ready-to-go button component
   * that includes three separate styles of button: default, cancel, and destructive.
   */
  export const Button: React.FC<ButtonProps>
}
