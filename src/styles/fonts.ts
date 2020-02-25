import { css } from 'styled-components'

import AvertaRegular from '../assets/fonts/Averta-Regular.woff2'
import AvertaBold from '../assets/fonts/Averta-Bold.woff2'
import RobotoMono from '../assets/fonts/RobotoMono-Regular.woff2'

const fontFace = css`
  @font-face {
    font-family: 'Averta';
    src: url(${AvertaRegular}) format('opentype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Averta';
    src: url(${AvertaBold}) format('opentype');
    font-weight: 700;
    font-style: normal;
  }
  font-face {
    font-family: 'Roboto Mono';
    src: url(${RobotoMono}) format('opentype');
    font-weight: 400;
    font-style: normal;
  }
`

export default fontFace
