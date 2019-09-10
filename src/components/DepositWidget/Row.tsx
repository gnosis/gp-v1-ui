import React from 'react'
import styled from 'styled-components'

const WrapperRow = styled.tr`
`

interface ButtonProps {
  btnType: ButtonTypes,
  tokenName?: string
}

const WrapperButton = styled.button<ButtonProps>`
  background-color: var(--color-${props => props.btnType}-btn-bg);
  color: white;
  min-width: 100px;
  height: 25px;
  border: 0.2em solid black;
  box-shadow: 0.2em 0.2em black;
  width: 100%;
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
  enableToken?: boolean
}

const getButtons = (tokenName: string, enableToken?: boolean) => {
  if (enableToken) {
    return <td colSpan={2}><Button btnType={ButtonTypes.ENABLE} tokenName={tokenName} /></td>
  } else {
    return (
      <div>
        <td><Button btnType={ButtonTypes.DEPOSIT} /></td>
        <td><Button btnType={ButtonTypes.WITHDRAW} /></td>
      </div>
    )
  }
}

export const Row: React.FC<RowProps> = (props) => (

  <WrapperRow>
    <td><img src={props.tokenLogo} alt={props.tokenName} /></td>
    <td>{props.tokenName}</td>
    <td>{props.exchangeWallet}</td>
    <td>{props.pendingDeposits}</td>
    <td>{props.pendingWithdraws}</td>
    {getButtons(props.tokenName, props.enableToken)}
  </WrapperRow>
)

export default Row