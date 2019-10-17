import React from 'react'
import styled from 'styled-components'

import unknownTokenImg from 'img/unknown-token.png'

const Wrapper = styled.img`
  width: 30px;
  height: 30px;
`

interface Props {
  image: string
  name: string
  // required to be able to apply custom styles
  // see https://www.styled-components.com/docs/basics#styling-any-component
  className?: string
}

function _loadFallbackTokenImage(event: React.SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget
  image.src = unknownTokenImg
}

const TokenImg: React.FC<Props> = ({ image, name, className }: Props) => {
  return <Wrapper src={image} alt={name} className={className} onError={_loadFallbackTokenImage} />
}

export default TokenImg
