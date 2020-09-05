import React, { CSSProperties } from 'react'

const CSS_DEFAULT: CSSProperties = {
  margin: '2rem auto',
  border: '2px dashed gray',
  padding: '2rem',
  minHeight: '20rem',
}

interface Props {
  style?: CSSProperties
}

export const Frame: React.FC<Props> = ({ style, children }) => (
  <div style={{ ...CSS_DEFAULT, ...style }}>{children}</div>
)
