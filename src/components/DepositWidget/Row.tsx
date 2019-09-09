import React from 'react'
import styled from 'styled-components'

const WrapperRow = styled.tr`
`

interface ButtonProps {
  btnType: ButtonTypes,
  tokenName?: string
}

const WrapperButton = styled.button<ButtonProps>`
  background-color: var(--color-${props => props.btnType}-btn-bg)
`

enum ButtonTypes {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  ENABLE = 'enable'
}

const getButtonText = (btnType: ButtonTypes, tokenName: string): string => {
  let text
  switch (btnType) {
    case ButtonTypes.DEPOSIT: {
      text = '+ Deposit'
      break
    }
    case ButtonTypes.WITHDRAW: {
      text = '- Withdraw'
      break
    }
    case ButtonTypes.ENABLE: {
      text = 'Enable ' + tokenName
      break
    }
  }
  return text
}

const Button: React.FC<ButtonProps> = (props) => (

  <WrapperButton {...props}>
    {getButtonText(props.btnType, props.tokenName)}
  </WrapperButton>
)

export interface RowProps {
  tokenLogo: string
  tokenName: string
  exchangeWallet: number
  pendingDeposits: number
  pendingWithdraws: number
}

export const Row: React.FC<RowProps> = (props) => (

  <WrapperRow>
    <td><img src={props.tokenLogo} alt={props.tokenName} /></td>
    <td>{props.tokenName}</td>
    <td>{props.exchangeWallet}</td>
    <td>{props.pendingDeposits}</td>
    <td>{props.pendingWithdraws}</td>
    <td><Button btnType={ButtonTypes.DEPOSIT} /></td>
    <td><Button btnType={ButtonTypes.WITHDRAW} /></td>
  </WrapperRow>
)

export default Row