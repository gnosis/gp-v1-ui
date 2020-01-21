import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import { HighlightDiv } from './PoolingWidget.styled'
import { EtherscanLink } from 'components/EtherscanLink'
import { AddFundingWrapper } from './AddFunding.styled'

interface AddFundingProps {
  txIdentifier: string
}

const AddFunding: React.FC<AddFundingProps> = ({ txIdentifier }) => (
  <AddFundingWrapper>
    <p>
      <strong>Great</strong> - your liquidity provision is being created right now.
    </p>

    <div>
      <HighlightDiv>
        <FontAwesomeIcon color="var(--color-button-primary)" icon={faSpinner} size="lg" spin />{' '}
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
