import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons'

import { EtherscanLink } from 'components/EtherscanLink'
import { HighlightDiv } from './PoolingWidget.styled'
import { AddFundingWrapper } from './AddFunding.styled'
import { Receipt } from 'types'

interface AddFundingProps {
  txIdentifier: string
  txReceipt?: Receipt
}

const AddFunding: React.FC<AddFundingProps> = ({ txIdentifier, txReceipt }) => (
  <AddFundingWrapper>
    <p>
      <strong>Great</strong> - your liquidity provision is being created right now.
    </p>

    <div>
      <HighlightDiv
        $bgColor={txReceipt ? 'var(--color-background-actionCards)' : 'var(--color-background-highlighted)'}
      >
        <FontAwesomeIcon
          color="var(--color-button-primary)"
          icon={txReceipt ? faCheckCircle : faSpinner}
          size="lg"
          spin={!txReceipt}
        />{' '}
        <span>
          You can check the transactions status on:{' '}
          <strong>
            <EtherscanLink type="tx" identifier={txIdentifier} label={`https://etherscan.io/tx/${txIdentifier}`} />
          </strong>
        </span>
      </HighlightDiv>
    </div>
    <p>
      Your standing orders will be visible on the{' '}
      <strong>
        <Link to="orders">Orders page</Link>
      </strong>{' '}
      where you can also cancel these at any time.
    </p>
    <div>
      <p>
        <strong>What now?</strong>
        <br />
        <strong>
          Go to the <Link to="wallet">Wallet page</Link> to deposit at least one of the tokens you selected in your
          liquidity provision.
        </strong>
      </p>
      <ul>
        <li>Your deposits are shared between all your orders of those tokens.</li>
        <li>You can decrease or increase your deposits at any time.</li>
      </ul>
    </div>
  </AddFundingWrapper>
)

export default AddFunding
