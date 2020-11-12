import { MEDIA } from 'const'
import styled from 'styled-components'

import arrowBlue from 'assets/img/arrow-blue.svg'
import arrowWhite from 'assets/img/arrow-white.svg'
import arrow from 'assets/img/arrow.svg'
import cog from 'assets/img/cog.svg'

export const Button = styled.button`
  color: var(--color-text-CTA);
  background-color: var(--color-background-CTA);

  font-family: inherit;
  font-weight: var(--font-weight-bold);
  cursor: pointer;

  transition: all 0.2s ease-in-out;
  transition-property: color, background-color, border-color, opacity;

  border: 0;
  outline: 0;

  &:hover {
    color: var(--color-text-button-hover);
    background-color: var(--color-background-button-hover);
  }

  &.cancel {
    background: transparent;
    color: var(--color-text-active);

    &:hover {
      background-color: var(--color-background-button-hover);
      color: var(--color-text-button-hover);
    }
  }

  &:disabled,
  &[disabled] {
    &:hover {
      background-color: var(--color-background-button-disabled-hover);
    }
    opacity: 0.35;
    pointer-events: none;
  }

  &.success {
    border-color: var(--color-button-success);
    color: var(--color-button-success);
    :hover {
      background-color: var(--color-button-success);
      border-color: var(--color-button-success);
      color: var(--color-background-pageWrapper);
    }
  }

  &.danger {
    border-color: var(--color-button-danger);
    color: var(--color-button-danger);
    :hover {
      background-color: var(--color-button-danger);
      border-color: var(--color-button-danger);
      color: var(--color-background-pageWrapper);
    }
  }

  &.secondary {
    border-color: var(--color-button-secondary);
    color: var(--color-button-secondary);
    :hover {
      border-color: black;
      color: black;
    }
  }

  &.big {
    font-size: 1.2rem;
    padding: 0.65rem 1rem;
  }

  &.small {
    font-size: 0.6rem;
    padding: 0.3rem 0.5rem;
  }
`

export const SettingsButtonSubmit = styled(Button)`
  height: 3.6rem;
  letter-spacing: 0.03rem;

  border-radius: 0.6rem;
  padding: 0 1.6rem;
  text-transform: uppercase;
  font-size: 1.4rem;
  line-height: 1;
`

export const SettingsButtonReset = styled(SettingsButtonSubmit)`
  background-color: transparent;
  color: var(--color-text-active);

  &:hover {
    color: var(--color-background-button-hover);
    background-color: transparent;
  }
`

export const TokenOptionItemButton = styled(Button)`
  border-radius: 3rem;
  padding: 0.6rem 1rem;
`

export const TokenSelectorButton = styled(Button)`
  background-color: transparent;
  font-size: 4rem;
  line-height: 1;
  color: #526877;
  opacity: 0.5;
  font-family: var(--font-mono);
  font-weight: var(--font-weight-regular);
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const DepositWidgetFormButton = styled(Button)`
  margin: 0;
  border-radius: 0.6rem;
  outline: 0;
  height: 3.6rem;
  box-sizing: border-box;
  letter-spacing: 0.03rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  text-transform: uppercase;
`

export const DepositWidgetFormButton2 = styled(DepositWidgetFormButton)`
  border-radius: 0.6rem;
  min-width: 14rem;
  padding: 0 1.6rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  font-size: 1.4rem;
  margin: 0;

  @media ${MEDIA.mobile} {
    margin: 1.6rem 0 1.6rem 1.6rem;
    font-size: 1.3rem;
    padding: 0 1rem;
  }

  > img,
  > svg {
    margin: 0 0 0 0.8rem;
  }
`

export const RowClaimButton = styled(Button)`
  margin: 0;
  padding: 0;
  text-align: right;
  font-size: inherit;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;

  &.success {
    color: #63ab52;
    background: transparent;

    &:hover {
      background: transparent;
      color: #63ab52;
    }
  }
  &.disabled {
    color: currentColor;
    cursor: not-allowed;
    opacity: 0.5;
  }

  > div {
    display: flex;
    align-items: inherit;

    > .immatureClaimTooltip {
      color: #d2a827;
      margin-left: 0.5rem;

      > span {
        margin: 0.5rem;
      }
    }
  }
`

export const OrdersWidgetButtonWithIcon = styled(Button)`
  padding: 0.5rem 1rem;
  border-radius: 6rem;
  border: 0.1rem solid var(--color-text-deleteOrders);
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
  background: transparent;
  color: var(--color-text-deleteOrders);
  outline: 0;

  &:hover {
    background: var(--color-text-deleteOrders);
    color: var(--color-background-pageWrapper);
  }

  > svg {
    margin: 0 0.25rem;
  }
`

export const OrdersWidgetCountContainerButton = styled(Button)`
  font-weight: var(--font-weight-bold);
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  letter-spacing: 0;
  text-align: center;
  background: transparent;
  height: 100%;
  outline: 0;
  text-transform: uppercase;
  display: flex;
  flex: 1 1 25%;
  width: 100%;
  justify-content: center;
  transition: border 0.2s ease-in-out;
  align-items: center;
  border-bottom: 0.3rem solid transparent;
  min-height: 6.4rem;

  &.selected {
    border-bottom: 0.3rem solid var(--color-text-active);
    color: var(--color-text-active);

    > i {
      background: var(--color-text-active);
    }
  }

  > i {
    font-weight: inherit;
    font-size: 1.1rem;
    color: var(--color-background-pageWrapper);
    letter-spacing: -0.046rem;
    text-align: center;
    background: var(--color-text-secondary);
    border-radius: 6rem;
    padding: 0 0.75rem;
    box-sizing: border-box;
    line-height: 1.8rem;
    font-style: normal;
    display: inline-block;
    height: 1.8rem;
    margin: 0 0 0 0.5rem;
  }

  @media ${MEDIA.mobile} {
    flex: 1;
    font-size: 1.2rem;
    min-height: 5.4rem;

    > i {
      font-size: 0.9rem;
      height: 1.3rem;
      line-height: 1.36rem;
    }
  }

  @media ${MEDIA.xSmallDown} {
    flex-flow: column nowrap;

    > i {
      margin: 0.3rem auto;
    }
  }
`
export const PoolingWidgetStepButtonsWrapperButton = styled(Button)`
  margin: 0 1.6rem;
  border-radius: 0.6rem;
  outline: 0;
  height: 3.6rem;
  box-sizing: border-box;
  letter-spacing: 0.03rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
`

export const PoolingWidgetStepButtonsWrapperBackButton = styled(Button)`
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  background: transparent;
  font-size: 1.4rem;
  color: var(--color-text-active);
  letter-spacing: 0;
  line-height: 1;
  transition: color 0.2s ease-in-out;

  @media ${MEDIA.mobile} {
    margin: 1.6rem 1.6rem 1.6rem 0;
    font-size: 1.3rem;
    padding: 0 1rem 0 0;
  }

  &:hover {
    background: 0;
    color: var(--color-background-button-hover);
  }

  &::before {
    content: '';
    background: url(${arrowBlue}) no-repeat center/contain;
    width: 0.7rem;
    height: 1.2rem;
    display: inline-block;
    margin: 0 0.8rem 0 0;
  }
`

export const PoolingWidgetStepButtonsWrapperLastButton = styled(Button)`
  border-radius: 0.6rem;
  min-width: 14rem;
  padding: 0 1.6rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  font-size: 1.4rem;
  margin: 0 1.6rem 0 auto;

  @media ${MEDIA.mobile} {
    margin: 1.6rem 0 1.6rem 1.6rem;
    font-size: 1.3rem;
    padding: 0 1rem;
  }

  > svg {
    margin: 0 0.8rem 0 0;
  }

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    pointer-events: initial;
  }

  &::after {
    content: '';
    background: url(${arrowWhite}) no-repeat center/contain;
    width: 0.7rem;
    height: 1.2rem;
    display: inline-block;
    margin: 0 0 0 0.8rem;
  }
`

export const PriceButton = styled(Button)`
  background: none;
  border: 0;
  outline: 0;
  color: var(--color-text-active);

  &:hover {
    text-decoration: underline;
  }
`

export const PriceSuggestionsButton = styled(Button)`
  border-radius: 3rem;
  padding: 0.5rem 1rem;
  font-size: smaller;
`

export const MaximumSlippageButton = styled(Button)`
  border-radius: 3rem;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-evenly;

  background: var(--color-background-input);
  color: var(--color-text-primary);
  font-size: inherit;
  font-weight: normal;

  height: 100%;

  padding: 0.65rem 1.5rem;
  &:not(:last-child) {
    margin-right: 1rem;
  }

  white-space: nowrap;

  &.selected,
  &.selected ~ small,
  &:hover:not(input),
  &:focus,
  &:focus ~ small {
    color: var(--color-text-button-hover);
  }

  &:hover:not(input):not(.selected),
  &:focus {
    background-color: var(--color-background-button-hover);
  }

  &.selected {
    background: var(--color-text-active);
  }

  transition: all 0.2s ease-in-out;

  > small {
    font-size: x-small;
    margin-left: 0.4rem;
  }
`

export const OrderValidityButton = styled(Button)`
  display: none;
  content: '';
  background: url(${cog}) no-repeat center/contain;
  width: 1.8rem;
  height: 1.8rem;
  margin-left: auto;
  opacity: 1;

  @media ${MEDIA.xSmallDown} {
    display: block;
  }
`

export const OrderValiditySpanButton = styled(Button)`
  border-radius: 0.6rem;
  min-width: 14rem;
  padding: 0 1.6rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  font-size: 1.4rem;
  outline: 0;
  height: 3.6rem;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  letter-spacing: 0.03rem;
`

export const TokenRowButton = styled(Button)`
  background: 0;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-active);
  font-size: inherit;
  margin: 0;
  padding: 0;
  text-decoration: underline;

  &::after {
    content: '-';
    margin: 0 0.5rem;
    display: inline-block;
    color: var(--color-text-secondary);
    text-decoration: none;
  }
`

export const TradeWidgetButton = styled(Button)`
  &:focus {
    outline: 1px dotted gray;
  }
`

export const TradeWidgetSubmitButton = styled(Button)`
  background-color: var(--color-background-CTA);
  color: var(--color-text-CTA);
  border-radius: 3rem;
  font-family: var(--font-default);
  font-size: 1.6rem;
  letter-spacing: 0.1rem;
  text-align: center;
  text-transform: uppercase;
  padding: 1rem 2rem;
  box-sizing: border-box;
  line-height: 1;
  width: 100%;
  font-weight: var(--font-weight-bold);
  height: 4.6rem;
  margin: 1rem auto 0;
  max-width: 32rem;

  @media ${MEDIA.mobile} {
    font-size: 1.3rem;
    margin: 1rem auto 1.6rem;
  }
`

export const TradeWidgetOrdersTogglerButton = styled(Button)<{ $isOpen?: boolean }>`
  width: 1.6rem;
  height: 100%;
  border-right: 0.1rem solid rgba(159, 180, 201, 0.5);
  background: var(--color-background);
  padding: 0;
  margin: 0;
  outline: 0;

  @media ${MEDIA.tablet}, ${MEDIA.mobile} {
    display: none;
  }

  &::before {
    display: block;
    content: ' ';
    background: url(${arrow}) no-repeat center/contain;
    height: 1.2rem;
    width: 100%;
    margin: 0;
    transform: rotate(${({ $isOpen }): number => ($isOpen ? 0.5 : 0)}turn);
  }

  &:hover {
    background-color: var(--color-background-banner);
  }
`

export const UserWalletWalletButton = styled(Button)`
  border-radius: 3rem;
  color: var(--color-text-CTA);
  font-size: 1.5rem;
  margin: 1.2rem 0;
  padding: 1rem 2rem;
  white-space: nowrap;
  width: auto;
`

export const BlockExplorerButton = styled(UserWalletWalletButton)`
  background: transparent;
  color: var(--color-text-primary);
  > a,
  > a:link,
  > a:visited {
    color: inherit;
    text-decoration: none;

    > span {
      text-decoration: underline;
    }
  }

  &:hover {
    color: var(--color-text-primary);
    background: none;
  }
`

export const LogInOutButton = styled(UserWalletWalletButton)<{ $loggedIn?: boolean }>`
  background: ${(props): string => (props.$loggedIn ? 'var(--color-button-danger)' : 'none')};
  color: ${(props): string => (props.$loggedIn ? 'var(--color-text-button-hover)' : 'var(--color-text-primary)')};
  margin: 0;
  font-family: var(--font-mono);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
  flex: 1;

  &:hover {
    background: ${(props): string => (props.$loggedIn ? 'var(--color-button-danger)' : 'none')};
    color: ${(props): string => (props.$loggedIn ? 'var(--color-text-button-hover)' : 'var(--color-text-primary)')};
    filter: grayscale(1);
  }

  > a {
    width: 100%;
    font-size: inherit;
  }

  @media ${MEDIA.mobile} {
    font-size: ${(props): string | false => !props.$loggedIn && '1.2rem'};
    padding: ${(props): string | false => !props.$loggedIn && '0'};
  }
`

export const UseTabsButton = styled(Button)`
  font-weight: var(--font-weight-bold);
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  letter-spacing: 0;
  text-align: center;
  background: transparent;
  height: 100%;
  outline: 0;
  text-transform: uppercase;
  display: flex;
  flex: 1 1 25%;
  width: 100%;
  justify-content: center;
  transition: border 0.2s ease-in-out;
  align-items: center;
  border-bottom: 0.3rem solid transparent;

  > i {
    font-weight: inherit;
    font-size: 1.1rem;
    color: var(--color-background-pageWrapper);
    letter-spacing: -0.046rem;
    text-align: center;
    background: var(--color-text-secondary);
    border-radius: 6rem;
    padding: 0 0.75rem;
    box-sizing: border-box;
    line-height: 1.8rem;
    font-style: normal;
    display: inline-block;
    height: 1.8rem;
    margin: 0 0 0 0.5rem;
  }

  @media ${MEDIA.mobile} {
    flex: 1;
    font-size: 1.2rem;
    min-height: 5.4rem;

    > i {
      font-size: 0.9rem;
      height: 1.3rem;
      line-height: 1.36rem;
    }
  }

  @media ${MEDIA.xSmallDown} {
    flex-flow: column nowrap;

    > i {
      margin: 0.3rem auto;
    }
  }

  &.selected {
    border-bottom: 0.3rem solid var(--color-text-active);
    color: var(--color-text-active);
  }
`
