import React, { useState, useRef, useMemo } from 'react'
import Modal from 'components/common/Modal'
import { useGlobalModal, UseGlobalModalParamsResult } from './GeneralModal'
import { Deferred, createDeferredPromise } from 'utils'

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
      console.log('MODAL::deferred', deferred)
      if (isShownRef.current) return deferred

      // will be resolved on Confirm/Cancel in Modal
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
