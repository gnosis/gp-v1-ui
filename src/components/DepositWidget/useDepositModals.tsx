import React, { useCallback } from 'react'
import BN from 'bn.js'
import Modal, { useModal, ModalHook, toggleModal } from 'components/common/Modal'

// Components
import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'

const OverwriteModalBody: React.FC = () => {
  return (
    <ModalBodyWrapper>
      <div>
        <p>
          You currently have a pending withdraw request. By sending this new withdraw request, you will overwrite the
          pending request amount. No funds will be lost.
        </p>
        <p>No funds will be lost.</p>
      </div>
      <strong>Do you wish to replace the previous withdraw request?</strong>
    </ModalBodyWrapper>
  )
}

const WithdrawAndClaimModalBody: React.FC = () => {
  return (
    <ModalBodyWrapper>
      <p>By sending this withdraw request, you will automatically receive all claimable amounts back to your wallet.</p>
    </ModalBodyWrapper>
  )
}

interface Params {
  amount: BN
  tokenAddress: string
  requestWithdrawToken: (amount: BN, tokenAddress: string) => Promise<void>
}

interface Result {
  withdrawOverwriteModal: ModalHook
  toggleWithdrawOverwriteModal: toggleModal
  withdrawAndClaimModal: ModalHook
  toggleWithdrawAndClaimModal: toggleModal
}

export function useDepositModals(params: Params): Result {
  const { amount, tokenAddress, requestWithdrawToken } = params

  const getButtons = useCallback(
    (toggleModal: toggleModal): React.ReactNode[] => {
      return [
        <Modal.Button label="Cancel" key="no" isStyleCancel onClick={toggleModal} />,
        <Modal.Button
          label="Continue"
          key="yes"
          isStyleDefault
          onClick={async (): Promise<void> => {
            // On confirm, do the request
            toggleModal()
            await requestWithdrawToken(amount, tokenAddress)
          }}
        />,
      ]
    },
    [amount, requestWithdrawToken, tokenAddress],
  )

  const [withdrawOverwriteModal, toggleWithdrawOverwriteModal] = useModal({
    ...DEFAULT_MODAL_OPTIONS,
    title: 'Confirm withdraw overwrite',
    message: <OverwriteModalBody />,
    buttons: getButtons((): void => {
      toggleWithdrawOverwriteModal()
    }),
  })

  const [withdrawAndClaimModal, toggleWithdrawAndClaimModal] = useModal({
    ...DEFAULT_MODAL_OPTIONS,
    title: 'Please note',
    message: <WithdrawAndClaimModalBody />,
    buttons: getButtons((): void => toggleWithdrawAndClaimModal()),
  })

  return { withdrawOverwriteModal, toggleWithdrawOverwriteModal, withdrawAndClaimModal, toggleWithdrawAndClaimModal }
}
