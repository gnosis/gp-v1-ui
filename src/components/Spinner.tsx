import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { SizeProp } from '@fortawesome/fontawesome-svg-core'

export interface SpinnerProps {
  spin?: boolean
  style?: React.CSSProperties
  size?: SizeProp
}

export const Spinner: React.FC<SpinnerProps> = ({ style, spin = true, size }) => (
  <FontAwesomeIcon icon={faSpinner} style={style} spin={spin} size={size} />
)

export default Spinner
