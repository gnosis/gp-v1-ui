import React, { useCallback } from 'react'
import BN from 'bn.js'

import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from '../Modal'
import Modali, { useModali, ModalHook, toggleModaliComponent } from 'modali'

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
  toggleWithdrawOverwriteModal: toggleModaliComponent
  withdrawAndClaimModal: ModalHook
  toggleWithdrawAndClaimModal: toggleModaliComponent
}

export function useDepositModals(params: Params): Result {
  const { amount, tokenAddress, requestWithdrawToken } = params

  const getButtons = useCallback(
    (toggleModal: toggleModaliComponent): React.ReactNode[] => {
      return [
        <Modali.Button label="Cancel" key="no" isStyleCancel onClick={toggleModal} />,
        <Modali.Button
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

  const [withdrawOverwriteModal, toggleWithdrawOverwriteModal] = useModali({
    ...DEFAULT_MODAL_OPTIONS,
    title: 'Confirm withdraw overwrite',
    message: <OverwriteModalBody />,
    buttons: getButtons((): void => {
      toggleWithdrawOverwriteModal()
    }),
  })

  const [withdrawAndClaimModal, toggleWithdrawAndClaimModal] = useModali({
    ...DEFAULT_MODAL_OPTIONS,
    title: 'Please note',
    message: <WithdrawAndClaimModalBody />,
    buttons: getButtons((): void => toggleWithdrawAndClaimModal()),
  })

  return { withdrawOverwriteModal, toggleWithdrawOverwriteModal, withdrawAndClaimModal, toggleWithdrawAndClaimModal }
}
