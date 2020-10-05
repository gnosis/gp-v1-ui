import Modal, { ModalHook, useModal } from 'components/common/Modal'
import React, { useRef } from 'react'

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

  const [modalProps, toggleModal] = useModal({
    animated: true,
    centered: true,
    title: 'Order Confirmation',
    // Function tosave on TxMessage renders
    message: isShown.current && (typeof message === 'function' ? message() : message),
    buttons: [
      // Cancel button only if there's anything to cancel
      <Modal.Button
        label="Cancel"
        key="no"
        isStyleCancel
        onClick={(): void => {
          toggleModal()
          onCancel?.()
        }}
      />,
      <Modal.Button
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
