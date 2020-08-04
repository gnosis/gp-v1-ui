import React from 'react'
import { formatTimeInHours } from 'utils'
import { useFormContext } from 'react-hook-form'
import { TokenDetails } from 'types'
import styled from 'styled-components'
import { TradeFormData } from '.'
import { displayTokenSymbolOrLink } from 'utils/display'
import { HelpTooltip } from 'components/Tooltip'
import useSafeState from 'hooks/useSafeState'

interface TxMessageProps {
  sellToken: TokenDetails
  receiveToken: TokenDetails
}

const TxMessageWrapper = styled.div`
  padding: 1em;

  > div.message {
    div.sectionTitle {
      margin: 0 0 0.2rem 0;
    }

    div:not(.sectionTitle) {
      margin-left: 1rem;
    }
  }
`
const ReceiveTooltip: React.FC<{ amount: string; buyToken: string | React.ReactNode; linkURL?: string }> = ({
  amount,
  linkURL = 'https://docs.gnosis.io/protocol/',
  buyToken,
}) => (
  <>
    You will receive at least {amount} {buyToken} if your order is completely executed. <br />
    ⚠️ Please remember that your order can be also partially executed, or not executed at all. <br />
    Read more about how Gnosis Protocol works{' '}
    <a target="_blank" rel="noreferrer" href={linkURL}>
      here
    </a>
    .
  </>
)

export const TxMessage: React.FC<TxMessageProps> = ({ sellToken, receiveToken }) => {
  const [orderHelpVisible, showOrderHelp] = useSafeState(false)
  const { getValues } = useFormContext<TradeFormData>()
  const {
    price,
    priceInverse,
    validFrom,
    validUntil,
    sellToken: sellTokenAmount,
    receiveToken: receiveTokenAmount,
  } = getValues()
  const displaySellToken = displayTokenSymbolOrLink(sellToken)
  const displayReceiveToken = displayTokenSymbolOrLink(receiveToken)

  return (
    <TxMessageWrapper>
      <div className="intro-text">
        <div>Carefully review the information below to make sure everything looks correct.</div>
      </div>
      <p>
        How is the order executed?
        <a onClick={(): void => showOrderHelp(!orderHelpVisible)}>
          {orderHelpVisible ? '[-] Show less...' : '[+] Show more...'}
        </a>
        {orderHelpVisible && (
          <>
            <ul>
              <li>
                After you confirm and send the ethereum transaction, your order will be active during the expecified
                validity time.
              </li>
              <li>
                During that time, it will be matched against other orders as long as there is an overlap in the limit
                prices.
              </li>
              <li>
                The limit price specified in this order will be respected, and{' '}
                <strong>no fee will be applied on top of it</strong>.
              </li>
              <li>You can cancel the order at any point after its creation.</li>
            </ul>
            <p>
              Check{' '}
              <a href="https://docs.gnosis.io/protocol/" target="_blank" rel="noreferrer">
                here
              </a>{' '}
              for more information on Gnosis Protocol.
            </p>
          </>
        )}
      </p>
      <div className="message">
        {/* Details */}
        <div className="sectionTitle">
          <strong>Order Details</strong>
        </div>
        <div>
          Sell: <span>{sellTokenAmount}</span> <strong>{displaySellToken}</strong>
        </div>
        <div>
          Receive: {receiveTokenAmount} <strong>{displayReceiveToken}</strong>{' '}
          <HelpTooltip tooltip={<ReceiveTooltip amount={receiveTokenAmount} buyToken={displayReceiveToken} />} />
        </div>

        {/* Prices */}
        <p>
          <div className="sectionTitle">
            <strong>Prices</strong>
          </div>
          <div>
            Direct: <span>{price}</span> <strong>{displayReceiveToken}</strong> per <strong>{displaySellToken}</strong>
          </div>
          <div>
            Inverse: <span>{priceInverse}</span> <strong>{displaySellToken}</strong> per{' '}
            <strong>{displayReceiveToken}</strong>
          </div>
        </p>

        {/* Order Validity */}
        <p>
          <div className="sectionTitle">
            <strong>Order Validity Details</strong>{' '}
            <HelpTooltip
              tooltip={
                <>
                  ⚠️ Learn more about the validity of orders in the Gnosis Protocol{' '}
                  <a target="_blank" rel="noreferrer" href="https://docs.gnosis.io/protocol/docs/intro-batches/#orders">
                    here
                  </a>
                  .
                </>
              }
            />
          </div>
          <div>
            Starts: <span>{formatTimeInHours(validFrom || 0, 'Now')}</span>
          </div>
          <div>
            Expires: <span>{formatTimeInHours(validUntil || 0, 'Never')}</span>
          </div>
        </p>
      </div>
    </TxMessageWrapper>
  )
}
