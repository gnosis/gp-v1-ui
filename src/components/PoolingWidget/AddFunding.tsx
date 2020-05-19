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
    <HighlightDiv $bgColor={txReceipt ? 'var(--color-background-actionCards)' : 'var(--color-background-highlighted)'}>
      <FontAwesomeIcon color="#2f842f" icon={txReceipt ? faCheckCircle : faSpinner} size="lg" spin={!txReceipt} />{' '}
      <span>
        You can check the transactions status on:{' '}
        <strong>
          <EtherscanLink type="tx" identifier={txIdentifier} label={`https://etherscan.io/tx/${txIdentifier}`} />
        </strong>
        <p>
          {txReceipt
            ? 'Your new liquidity has been successfully mined and submitted! Please carefully read the instructions below.'
            : ''}
        </p>
      </span>
    </HighlightDiv>
    <p>
      <strong>Great</strong> - your liquidity provision is being created right now. Your standing orders will be visible
      on the{' '}
      <strong>
        <Link to="orders">Orders page</Link>
      </strong>{' '}
      where you can also cancel these at any time.
    </p>
    <p>
      <strong>What now?</strong>
      <br />
      Go to the <Link to="wallet">Balances page</Link> to deposit at least one of the tokens you selected in your
      liquidity provision.
    </p>
    <ul>
      <li>Your deposits are shared between all your orders of those tokens.</li>
      <li>You can decrease or increase your deposits at any time.</li>
    </ul>
  </AddFundingWrapper>
)

export default AddFunding
