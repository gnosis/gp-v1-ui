import { css } from 'styled-components'

import AvertaRegular from '../assets/fonts/Averta-Regular.otf'
import AvertaBold from '../assets/fonts/Averta-Bold.otf'
import AvertaExtraBold from '../assets/fonts/Averta-Extrabold.otf'

const fontFace = css`
  @font-face {
    font-family: 'Averta';
    src: url(${AvertaRegular}) format('opentype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Averta';
    src: url(${AvertaBold}) format('opentype');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Averta';
    src: url(${AvertaExtraBold}) format('opentype');
    font-weight: 900;
    font-style: normal;
  }
`

export default fontFace
