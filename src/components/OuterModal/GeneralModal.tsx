import React from 'react'

import Modal, { useModal, ModalOptions, toggleModal, ModalHook } from 'components/common/Modal'
import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'

const defaultOptions: ModalOptions = {
  ...DEFAULT_MODAL_OPTIONS,
  overlayClose: false,
  keyboardClose: false,
  closeButton: false,
}

export interface UseGlobalModalParams extends Omit<ModalOptions, 'buttons'> {
  buttons: [typeof Modal.Button | null, typeof Modal.Button | null]
  resolve?: (result: boolean) => void
}

export interface UseGlobalModalParamsResult {
  modalProps: ModalHook
  toggleModal: toggleModal
}

const defaultGlobalModalParams: UseGlobalModalParams = {
  buttons: [Modal.Button, Modal.Button],
}

export const useGlobalModal = ({
  message,
  buttons: [LeftButton, RightButton],
  resolve,
  ...restModalOptions
}: UseGlobalModalParams = defaultGlobalModalParams): UseGlobalModalParamsResult => {
  const [modalProps, toggleModal] = useModal({
    ...defaultOptions,
    ...restModalOptions,
    message: message ? <ModalBodyWrapper>{message}</ModalBodyWrapper> : null,
    buttons: [
      LeftButton && (
        <LeftButton
          label="Cancel"
          key="no"
          isStyleCancel
          onClick={(): void => {
            toggleModal()
            resolve?.(false)
          }}
        />
      ),
      RightButton && (
        <RightButton
          label="Confirm"
          key="yes"
          isStyleDefault
          onClick={(): void => {
            toggleModal()
            resolve?.(true)
          }}
        />
      ),
    ],
  })

  return {
    modalProps,
    toggleModal,
  }
}
