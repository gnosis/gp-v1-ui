import React from 'react'
import styled from 'styled-components'

import Highlight from 'components/Highlight'
import TokenImg from 'components/TokenImg'
import { TokenDetails } from 'types'
import { safeTokenName } from 'utils'

const TokenImgWrapper = styled(TokenImg)`
  height: 1.25em;
  width: 1.25em;

  vertical-align: middle;
`

interface TokenInfoParams {
  token: TokenDetails
  amount: string | React.ReactNode
  highlight?: boolean
}

const TokenInfo: React.FC<TokenInfoParams> = ({ token, amount, highlight = true }) => {
  return (
    <>
      {highlight ? <Highlight>{amount}</Highlight> : amount} <TokenImgWrapper src={token.image} />{' '}
      <strong>{safeTokenName(token)}</strong>
    </>
  )
}

// TODO: temporary params, adjust when implementing real logic
// probably just take an Order object?
interface Params {
  id: string
  sellToken: TokenDetails
  buyToken: TokenDetails
  price: string
  sellTotal: string | React.ReactNode
  matched: string
  expiresOn: string | React.ReactNode
}

const OrderRow: React.FC<Params> = ({ id, sellToken, buyToken, price, sellTotal, matched, expiresOn }) => {
  return (
    <div className="rowContainer">
      <input type="checkbox" />
      <div className="cell">{id}</div>
      <div className="cell">
        Sell <TokenInfo token={sellToken} amount="1" /> for <strong>at least</strong>{' '}
        <TokenInfo token={buyToken} amount={price} />
      </div>
      <div className="cell">
        <TokenInfo token={sellToken} amount={sellTotal} highlight={false} />
      </div>
      <div className="cell">{matched}</div>
      <div className="cell">{expiresOn}</div>
    </div>
  )
}

export default OrderRow
