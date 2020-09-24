import React from 'react'
import styled from 'styled-components'

import { getImageUrl, RequireContextMock, safeTokenName } from 'utils'
import unknownTokenImg from 'assets/img/unknown-token.png'

const Wrapper = styled.img<WrapperProps>`
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 3.6rem;
  object-fit: contain;
  background-color: white;
  padding: 2px;
  opacity: ${(props): number => (props.faded ? 0.4 : 1)};
`

function _loadFallbackTokenImage(event: React.SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget
  image.src = unknownTokenImg
}

export interface Props {
  symbol?: string
  name?: string
  address: string
  addressMainnet?: string
  faded?: boolean
}

export interface WrapperProps {
  faded?: boolean
}

const tokensIconsRequire =
  process.env.NODE_ENV === 'test' ? RequireContextMock : require.context('assets/img/tokens', false)
const tokensIconsFiles = tokensIconsRequire.keys()

export const TokenImg: React.FC<Props> = (props) => {
  const { address, addressMainnet, symbol, name } = props

  const iconFile = tokensIconsFiles.find(
    (file) => file.includes(address) || (addressMainnet && file.includes(addressMainnet)),
  )
  const iconFileUrl = iconFile ? tokensIconsRequire(iconFile) : undefined
  // TODO: Simplify safeTokenName signature, it doesn't need the addressMainnet or id!
  // https://github.com/gnosis/dex-react/issues/1442
  const safeName = safeTokenName({ id: 0, address, addressMainnet, symbol, name })
  return (
    <Wrapper
      alt={safeName}
      src={iconFileUrl || getImageUrl(addressMainnet || address)}
      onError={_loadFallbackTokenImage}
      {...props}
    />
  )
}

export const TokenImgWrapper = styled(TokenImg)`
  margin: 0 1rem 0 0;
`

export default TokenImg
