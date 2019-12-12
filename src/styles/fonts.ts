import { css } from 'styled-components'

import AvertaRegular from '../assets/fonts/Averta-Regular.otf'
import AvertaBold from '../assets/fonts/Averta-Bold.otf'
import AvertaExtraBold from '../assets/fonts/Averta-Extrabold.otf'

const fontFace = css`
  @font-face {
    font-family: 'Averta';
    src: url(${AvertaRegular});
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Averta';
    src: url(${AvertaBold});
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Averta';
    src: url(${AvertaExtraBold});
    font-weight: 900;
    font-style: normal;
  }
`

export default fontFace
