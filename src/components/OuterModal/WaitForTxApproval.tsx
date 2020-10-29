import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import styled from 'styled-components'

import Modal from 'components/common/Modal'
import { openGlobalModal, useGlobalModalContext, setOuterModalContext, closeGlobalModal } from './SingletonModal'

const WaitForTxWrapper = styled.div`
  font-size: 1.3em;
`

interface GlobaModalContextSlice {
  pendingTxApprovals: Set<number | string>
}

export const WaitForTxApprovalMessage: React.FC = () => {
  const { pendingTxApprovals } = useGlobalModalContext<GlobaModalContextSlice>()

  return (
    <WaitForTxWrapper>
      <h4>No response from wallet for pending transaction</h4>
      <p>There are currently {pendingTxApprovals.size} transactions waiting for approval for your wallet.</p>
      <p>
        Mesa has detected a potential transaction timeout. Please validate with your wallet that you have properly
        accepted or rejected the transaction.
      </p>
      <p>Do you need more time signing the transaction?</p>
// time to display `Will Close` message
const CLOSE_DELAY = 3000

export const WaitForTxApprovalMessage: React.FC = () => {
  const { pendingTxApprovals } = useGlobalModalContext<GlobaModalContextSlice>()
  const pendingTxNumber = pendingTxApprovals.size

  useEffect(() => {
    // don't close immediately when txs resolved/rejected
    // allow time to read `Will Close` message
    if (pendingTxNumber === 0) setTimeout(closeGlobalModal, CLOSE_DELAY)
  }, [pendingTxNumber])
    </WaitForTxWrapper>
  )
}

const leftButton: typeof Modal.Button = (props) => <Modal.Button {...props} label="No, stop waiting" />
const rightButton: typeof Modal.Button = (props) => <Modal.Button {...props} label="Yes" />

let txsPendingApprovalCount = 0
export const areTxsPendingApproval = (): boolean => txsPendingApprovalCount > 0

export const addTxPendingApproval = (id: number | string | void): void => {
  if (id === undefined) return

  setOuterModalContext<GlobaModalContextSlice>(({ pendingTxApprovals = new Set(), ...rest }) => {
    const newPendingTxApprovals = new Set(pendingTxApprovals)
    newPendingTxApprovals.add(id)
    txsPendingApprovalCount = newPendingTxApprovals.size

    return {
      ...rest,
      pendingTxApprovals: newPendingTxApprovals,
    }
  })
}
export const removeTxPendingApproval = (id: number | string | void): void => {
  if (id === undefined) return

  setOuterModalContext<GlobaModalContextSlice>(({ pendingTxApprovals = new Set(), ...rest }) => {
    const newPendingTxApprovals = new Set(pendingTxApprovals)
    newPendingTxApprovals.delete(id)

    txsPendingApprovalCount = newPendingTxApprovals.size

    return {
      ...rest,
      pendingTxApprovals: newPendingTxApprovals,
    }
  })
}

export const openWaitForTxApprovalModal = (): Promise<boolean> =>
  openGlobalModal({
    message: <WaitForTxApprovalMessage />,
    leftButton,
    rightButton,
  })
