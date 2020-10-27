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
      <h4>No response from wallet for pending transaction</h4>
      <p>
        Mesa has detected a potential transaction timeout. Please validate with your wallet that you have properly
        accepted or rejected the transaction.
      </p>
      <p>Do you need more time signing the transaction?</p>
    </WaitForTxWrapper>
  )
}

const leftButton: typeof Modal.Button = (props) => <Modal.Button {...props} label="No, stop waiting" />
const rightButton: typeof Modal.Button = (props) => <Modal.Button {...props} label="Yes" />

export const openWaitForTxApprovalModal = (timePassed: number): Promise<boolean> =>
  openGlobalModal({
    message: <WaitForTxApprovalMessage timePassed={timePassed} />,
    leftButton,
    rightButton,
  })
