import * as React from 'react'
import styled from 'styled-components'

import { TokenBalanceDetails } from 'types'
import unknownTokenImg from 'img/unknown-token.png'

const WrapperRow = styled.tr`
  img {
    width: 30px;
    height: 30px;
  }
`

interface ButtonProps {
  btnType: ButtonTypes
  tokenName?: string
}

// prettier-ignore
const WrapperButton = styled.button<ButtonProps>`
  background-color: var(--color-${(props: ButtonProps): string => props.btnType}-btn-bg);
  color: white;
  min-width: 100px;
  height: 25px;
  border: 0.2em solid black;
  box-shadow: 0.2em 0.2em black;
  width: 100%;
`

export enum ButtonTypes {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  ENABLE = 'enable',
}

export const getButtonText = (btnType: ButtonTypes, tokenName: string): string => {
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

function loadFallbackTokenImage(event: React.FormEvent<HTMLImageElement>): void {
  const image = event.target as HTMLImageElement
  image.src = unknownTokenImg
}

const Button: React.FC<ButtonProps> = (props: ButtonProps) => (
  <WrapperButton {...props}>{getButtonText(props.btnType, props.tokenName)}</WrapperButton>
)

export interface RowProps {
  tokenBalances: TokenBalanceDetails
}

interface ButtonsProps {
  tokenName: string
  enableToken?: boolean
}

const Buttons: React.FC<ButtonsProps> = (props: ButtonsProps) => {
  if (props.enableToken) {
    return (
      <td colSpan={2}>
        <Button btnType={ButtonTypes.ENABLE} tokenName={props.tokenName} />
      </td>
    )
  } else {
    return (
      <div>
        <td>
          <Button btnType={ButtonTypes.DEPOSIT} />
        </td>
        <td>
          <Button btnType={ButtonTypes.WITHDRAW} />
        </td>
      </div>
    )
  }
}

export const Row: React.FC<RowProps> = (props: RowProps) => {
  const tokenBalances = props.tokenBalances

  return (
    <WrapperRow data-address={tokenBalances.address} data-address-mainnet={tokenBalances.addressMainnet}>
      <td>
        <img src={tokenBalances.image} alt={tokenBalances.name} onError={loadFallbackTokenImage} />
      </td>
      <td>{tokenBalances.name}</td>
      <td>{tokenBalances.exchangeWallet}</td>
      <td>{tokenBalances.pendingDeposits}</td>
      <td>{tokenBalances.pendingWithdraws}</td>
      {Buttons({
        tokenName: tokenBalances.symbol,
        enableToken: tokenBalances.enabled,
      })}
    </WrapperRow>
  )
}

export default Row
