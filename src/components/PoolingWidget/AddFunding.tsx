import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import { HighlightDiv } from './PoolingWidget.styled'
import { EtherscanLink } from 'components/EtherscanLink'

const AddFundingWrapper = styled.div`
  display: grid;
  grid-template-rows: repeat(auto-fit, minmax(2rem, 1fr));
  grid-gap: 0.2rem 0rem;

  > *:not(:nth-child(2)) {
    padding: 0 0.8rem;
  }

  ${HighlightDiv} {
    border-radius: var(--border-radius);
    padding: 0.8rem;
    > span {
      margin: 0 0.5rem;
    }
  }
`

interface AddFundingProps {
  txIdentifier: string
}

const AddFunding: React.FC<AddFundingProps> = ({ txIdentifier }) => {
  return (
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
}

export default AddFunding
