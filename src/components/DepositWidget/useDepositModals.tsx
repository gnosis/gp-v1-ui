import React from 'react'
import BN from 'bn.js'

import { ModalBodyWrapper } from './Styled'
import Modali, { useModali, ModalHook, toggleModaliComponent } from 'modali'

const OverwriteModalBody: React.FC = () => {
  return (
    <ModalBodyWrapper>
      <div>
        <p>You have a pending withdraw request. </p>
        <p>Sending this one will overwrite the pending amount.</p>
        <p>No funds will be lost.</p>
      </div>
      <p>Do you wish to replace the previous withdraw request?</p>
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

const defaultOptions = {
  centered: true,
  animated: true,
}

interface Params {
  amount: BN
  tokenAddress: string
  requestWithdraw: (amount: BN, tokenAddress: string) => Promise<void>
}

interface Result {
  withdrawOverwriteModal: ModalHook
  toggleWithdrawOverwriteModal: toggleModaliComponent
  withdrawAndClaimModal: ModalHook
  toggleWithdrawAndClaimModal: toggleModaliComponent
}

export function useDepositModals(params: Params): Result {
  const { amount, tokenAddress, requestWithdraw } = params

  const [withdrawOverwriteModal, toggleWithdrawOverwriteModal] = useModali({
    ...defaultOptions,
    title: 'Confirm withdraw overwrite',
    message: <OverwriteModalBody />,
    buttons: [
      <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => toggleWithdrawOverwriteModal()} />,
      <Modali.Button
        label="Continue"
        key="yes"
        isStyleDefault
        onClick={async (): Promise<void> => {
          // On confirm, do the request
          toggleWithdrawOverwriteModal()
          await requestWithdraw(amount, tokenAddress)
        }}
      />,
    ],
  })

  const [withdrawAndClaimModal, toggleWithdrawAndClaimModal] = useModali({
    ...defaultOptions,
    title: 'Please note',
    message: <WithdrawAndClaimModalBody />,
    buttons: [
      <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => toggleWithdrawAndClaimModal()} />,
      <Modali.Button
        label="Continue"
        key="yes"
        isStyleDefault
        onClick={async (): Promise<void> => {
          // On confirm, do the request
          toggleWithdrawAndClaimModal()
          await requestWithdraw(amount, tokenAddress)
        }}
      />,
    ],
  })

  return { withdrawOverwriteModal, toggleWithdrawOverwriteModal, withdrawAndClaimModal, toggleWithdrawAndClaimModal }
}
