import React from 'react'
import { Frame } from 'components/common/Frame'

export interface Props {
  label: string
}

export const Header: React.FC<Props> = (props) => <Frame>{props.label}</Frame>
