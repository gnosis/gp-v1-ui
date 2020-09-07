import React, { useRef } from 'react'
import Modali, { useModali, ModalHook } from 'modali'

interface UseSubmitTxResult {
  toggleModal: () => void
  modalProps: ModalHook
}

interface ClickWrapperProps {
  onConfirm: () => void
  onCancel?: () => void
  message?: (() => React.ReactNode) | React.ReactNode
}

export const useSubmitTxModal = ({ onCancel, onConfirm, message }: ClickWrapperProps): UseSubmitTxResult => {
  const isShown = useRef(false)

  const [modalProps, toggleModal] = useModali({
    animated: true,
    centered: true,
    title: 'Order Confirmation',
    // Function tosave on TxMessage renders
    message: isShown.current && (typeof message === 'function' ? message() : message),
    buttons: [
      // Cancel button only if there's anything to cancel
      <Modali.Button
        label="Cancel"
        key="no"
        isStyleCancel
        onClick={(): void => {
          toggleModal()
          onCancel?.()
        }}
      />,
      <Modali.Button
        // nothing to add -- Close
        label="Confirm"
        key="yes"
        isStyleDefault
        onClick={(): void => {
          toggleModal()
          onConfirm()
        }}
      />,
    ],
  })

  isShown.current = modalProps.isShown

  return { modalProps, toggleModal }
}
