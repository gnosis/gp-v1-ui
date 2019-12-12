import React from 'react'
import styled from 'styled-components'

import unknownTokenImg from 'assets/img/unknown-token.png'

function _loadFallbackTokenImage(event: React.SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget
  image.src = unknownTokenImg
}

export default styled.img.attrs(() => ({ onError: _loadFallbackTokenImage }))`
  width: 30px;
  height: 30px;

  border-radius: 50%;
  object-fit: cover;
`
