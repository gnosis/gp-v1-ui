import React from 'react'
import styled from 'styled-components'

import Modal from 'components/common/Modal'
import { openGlobalModal } from './SingletonModal'

const WaitForTxWrapper = styled.div`
  font-size: 1.3em;
`

export const WaitForTxApprovalMessage: React.FC<{ timePassed: number }> = ({ timePassed }) => {
  return (
    <WaitForTxWrapper>
      <p>
        It has been {timePassed} seconds since transaction was submitted for approval. Some wallets do not respond to{' '}
        <code>eth_sendTransaction</code> calls.
      </p>
      <p>Stop waiting for transaction approval from Wallet?</p>
    </WaitForTxWrapper>
  )
}

const leftButton: typeof Modal.Button = (props) => <Modal.Button {...props} label="No" />
const rightButton: typeof Modal.Button = (props) => <Modal.Button {...props} label="Yes" />

export const openWaitForTxApprovalModal = (timePassed: number): Promise<boolean> =>
  openGlobalModal({
    message: <WaitForTxApprovalMessage timePassed={timePassed} />,
    leftButton,
    rightButton,
  })
