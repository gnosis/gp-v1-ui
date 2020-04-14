import React from 'react'
import styled from 'styled-components'
import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'
import Modali, { useModali } from 'modali'
import OrderBookWidget from './OrderBookWidget'
import { TokenDetails, Network } from 'types'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { safeTokenName, getNetworkFromId } from '@gnosis.pm/dex-js'
import TokenSelector from './TokenSelector'
import useSafeState from 'hooks/useSafeState'
import { useTokenList } from 'hooks/useTokenList'
import { MEDIA } from 'const'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ViewOrderBookBtn = styled.button`
  margin: 0 0 0 auto;
  text-align: right;

  svg {
    font-size: 1.7rem;
    fill: var(--color-text-active);
    margin-left: 0.5rem;
  }
`

const ModalWrapper = styled(ModalBodyWrapper)`
  display: flex;
  /* min-height: 40rem; */
  /* height: calc(100vh - 30rem); */
  text-align: center;
  height: 100%;
  min-width: 100%;
  width: 100%;
  align-items: center;
  align-content: flex-start;
  flex-flow: row wrap;
  padding: 0;
  justify-content: center;
  
  /* @media ${MEDIA.tabletPortrait} {
    min-height:
  } */

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    margin: 1.6rem 0 1rem;
  }

  > span:first-of-type::after {
    content: '⟶';
    margin: 0 1rem;

    @media ${MEDIA.mobile} {
      display: none;
    }
  }

  > span:first-of-type > p {
    margin: 0 1rem 0 0;
  }

  > span:last-of-type > p {
    margin: 0 0 0 1rem;
  }

  .amcharts-Sprite-group {
    font-size: 1rem;
  }

  .amcharts-Container .amcharts-Label {
    text-transform: uppercase;
    font-size: 1.2rem;
  }

  .amcharts-ZoomOutButton-group > .amcharts-RoundedRectangle-group {
    fill: var(--color-text-active);
    opacity: 0.6;
    transition: 0.3s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`

interface OrderBookBtnProps {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  label?: string
  className?: string
}

export const OrderBookBtn: React.FC<OrderBookBtnProps> = (props: OrderBookBtnProps) => {
  const { baseToken: baseTokenDefault, quoteToken: quoteTokenDefault, label, className } = props
  const { networkIdOrDefault: networkId } = useWalletConnection()
  const tokenList = useTokenList(networkId)
  const [baseToken, setBaseToken] = useSafeState<TokenDetails>(baseTokenDefault)
  const [quoteToken, setQuoteToken] = useSafeState<TokenDetails>(quoteTokenDefault)
  const networkDescription = networkId !== Network.Mainnet ? ` (${getNetworkFromId(networkId)})` : ''

  const [modalHook, toggleModal] = useModali({
    ...DEFAULT_MODAL_OPTIONS,
    large: true,
    title: `${safeTokenName(baseToken)}-${safeTokenName(quoteToken)} Order book${networkDescription}`,
    message: (
      <ModalWrapper>
        <span>
          <p>Bid</p> <TokenSelector tokens={tokenList} selected={baseToken} onChange={setBaseToken} />
        </span>
        <span>
          <TokenSelector tokens={tokenList} selected={quoteToken} onChange={setQuoteToken} /> <p>Ask</p>
        </span>
        <OrderBookWidget baseToken={baseToken} quoteToken={quoteToken} networkId={networkId} />
      </ModalWrapper>
    ),
    buttons: [
      <>&nbsp;</>,
      <Modali.Button label="Close" key="yes" isStyleDefault onClick={(): void => modalHook.hide()} />,
    ],
  })

  return (
    <>
      <ViewOrderBookBtn className={className} onClick={toggleModal}>
        {label || 'View Order Book'} <FontAwesomeIcon className="chart-icon" icon={faChartLine} />
      </ViewOrderBookBtn>
      <Modali.Modal {...modalHook} />
    </>
  )
}
