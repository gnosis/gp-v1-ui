import Modal, { useModal, ModalOptions, toggleModal, ModalHook } from 'components/common/Modal'
import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'

import React, { useState, useMemo, useRef } from 'react'
import { Deferred, createDeferredPromise } from 'utils'

const defaultOptions: ModalOptions = {
  ...DEFAULT_MODAL_OPTIONS,
  overlayClose: false,
  keyboardClose: false,
  closeButton: false,
}

interface UseGlobalModalParams extends Omit<ModalOptions, 'buttons'> {
  buttons: [typeof Modal.Button | null, typeof Modal.Button | null]
  resolve?: (result: boolean) => void
}

interface UseGlobalModalParamsResult {
  modalProps: ModalHook
  toggleModal: toggleModal
}

const defaultGlobalModalParams: UseGlobalModalParams = {
  buttons: [Modal.Button, Modal.Button],
}

const useGlobalModal = ({
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
          label="No"
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
          label="Yes"
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

interface FillAndToggleModal {
  message: React.ReactNode
  title?: React.ReactNode
  leftButton?: typeof Modal.Button
  rightButton?: typeof Modal.Button
}

interface OuterModalOptions {
  message: React.ReactNode
  title?: React.ReactNode
  leftButton: typeof Modal.Button
  rightButton: typeof Modal.Button
  resolve?: (result: boolean) => void
}

const defaultButtons: Pick<OuterModalOptions, 'leftButton' | 'rightButton'> = {
  leftButton: Modal.Button,
  rightButton: Modal.Button,
}

const defaultModalOptions: OuterModalOptions = {
  message: null,
  ...defaultButtons,
}

export let openGlobalModal: (params: FillAndToggleModal) => Promise<boolean> = () => Promise.resolve(false)
export let closeGlobalModal: () => void = () => void 0

const WaitForTxApprovalMessage: React.FC<{ timePassed: number }> = ({ timePassed }) => {
  return (
    <p>
      It has been {timePassed} seconds since transaction was submitted for approval. Some wallets do not respond to{' '}
      <code>eth_sendTransaction</code> calls. Stop waiting for transaction approval from Wallet?
    </p>
  )
}
export const openWaitForTxApprovalModal = (timePassed: number): Promise<boolean> =>
  openGlobalModal({ message: <WaitForTxApprovalMessage timePassed={timePassed} /> })

const useOuterModalHook = (): UseGlobalModalParamsResult => {
  const [modalOptions, setModalOptions] = useState<OuterModalOptions>(defaultModalOptions)

  const { modalProps, toggleModal } = useGlobalModal({
    ...modalOptions,
    buttons: [modalOptions.leftButton, modalOptions.rightButton],
    message: modalOptions.message,
  })

  // toggleModal recreated every time, keep ref to use in Promise.then
  const toggleRef = useRef(toggleModal)
  toggleRef.current = toggleModal
  // same for modalProps.isShown
  const isShownRef = useRef(modalProps.isShown)
  isShownRef.current = modalProps.isShown

  useMemo(() => {
    let deferred: Deferred<boolean>
    const fillAndOpenModal = (components: FillAndToggleModal): Promise<boolean> => {
      // guard against double-open
      // only one such Modal allowed at a time
      if (isShownRef.current) return Promise.resolve(false)

      // will be resolved on Confirm/Cancelin Modal
      deferred = createDeferredPromise<boolean>()

      setModalOptions({
        ...defaultButtons,
        ...components,
        resolve: deferred.resolve,
      })
      toggleRef.current()

      return deferred
    }
    openGlobalModal = fillAndOpenModal
    closeGlobalModal = (): void => {
      // guard agains double-close
      if (!isShownRef.current) return

      toggleRef.current()
      deferred.resolve(false)
    }

    return fillAndOpenModal
  }, [])

  return {
    toggleModal,
    modalProps: {
      ...modalProps,
      ...modalOptions,
    },
  }
}

const GlobalModal: React.FC = () => {
  const { modalProps } = useOuterModalHook()

  return <Modal.Modal {...modalProps} />
}

// singleton to have and escape hatch
// for toggling modal outside of react
export const GlobalModalInstance = <GlobalModal />
