import { css } from 'styled-components'

import InterRegular from '../assets/fonts/Inter-Regular.woff2'
import InterBold from '../assets/fonts/Inter-Bold.woff2'
import RobotoMono from '../assets/fonts/RobotoMono-Regular.woff2'

const fontFace = css`
  @font-face {
    font-family: 'Inter';
    src: url(${InterRegular}) format('opentype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url(${InterBold}) format('opentype');
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
