import React from 'react'
import styled from 'styled-components'
import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'
import Modali, { useModali } from 'modali'
import OrderBookWidget from './OrderBookWidget'
import { TokenDetails } from 'types'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { safeTokenName } from '@gnosis.pm/dex-js'
import TokenSelector from './TokenSelector'
import useSafeState from 'hooks/useSafeState'
import { useTokenList } from 'hooks/useTokenList'

const ModalWrapper = styled(ModalBodyWrapper)``

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

  const [modalHook, toggleModal] = useModali({
    ...DEFAULT_MODAL_OPTIONS,
    large: true,
    title: `${safeTokenName(baseToken)}-${safeTokenName(quoteToken)} Order book`,
    message: (
      <ModalWrapper>
        <TokenSelector tokens={tokenList} selected={baseToken} onChange={setBaseToken} />
        <TokenSelector tokens={tokenList} selected={quoteToken} onChange={setQuoteToken} />
        <OrderBookWidget baseToken={baseToken} quoteToken={quoteToken} networkId={networkId} />
      </ModalWrapper>
    ),
    buttons: [<Modali.Button label="Close" key="yes" isStyleDefault onClick={(): void => modalHook.hide()} />],
  })

  return (
    <>
      <button className={className} onClick={toggleModal}>
        {label || 'View Order Book'}
      </button>
      <Modali.Modal {...modalHook} />
    </>
  )
}
