import React from 'react'
import styled from 'styled-components'
import { Button, ButtonTypes } from './Button'

const WrapperRow = styled.tr`
`

export interface RowProps {
  tokenLogo: string
  tokenName: string
  exchangeWallet: number
  pendingDeposits: number
  pendingWithdraws: number
}

export class Row extends React.Component<RowProps> {
  constructor(props: RowProps) {
    super(props)
  }

  render() {
    return (
      <WrapperRow>
        <td><img src={this.props.tokenLogo} alt={this.props.tokenName} /></td>
        <td>{this.props.tokenName}</td>
        <td>{this.props.exchangeWallet}</td>
        <td>{this.props.pendingDeposits}</td>
        <td>{this.props.pendingWithdraws}</td>
        <td><Button btnType={ButtonTypes.DEPOSIT} /></td>
        <td><Button btnType={ButtonTypes.WITHDRAW} /></td>
      </WrapperRow>
    )
  }
}