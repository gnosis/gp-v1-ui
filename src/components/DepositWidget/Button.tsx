import React from 'react'
import styled from 'styled-components'


interface ButtonProps {
  btnType: ButtonTypes,
  tokenName?: string
}

const WrapperButton = styled.button<ButtonProps>`
  background-color: var(--color-${props => props.btnType}-btn-bg)
`

export enum ButtonTypes {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  ENABLE = 'enable'
}

export class Button extends React.Component<ButtonProps> {
  constructor(props: ButtonProps) {
    super(props)
  }

  render() {
    let text
    switch (this.props.btnType) {
      case ButtonTypes.DEPOSIT: {
        text = '+ Deposit'
        break
      }
      case ButtonTypes.WITHDRAW: {
        text = '- Withdraw'
        break
      }
      case ButtonTypes.ENABLE: {
        text = 'Enable ' + this.props.tokenName
        break
      }
    }

    return (
      <WrapperButton {...this.props}>
        {text}
      </WrapperButton>
    )
  }
}