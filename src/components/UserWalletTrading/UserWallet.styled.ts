import styled from 'styled-components'

// Assets
import walletIMGWhite from 'assets/img/wallet-v2-white.svg'

// Styles
import { MEDIA } from 'const'

export const UserWalletWrapper = styled.li`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  line-height: 1;
  text-align: left;
  position: relative;
  margin: 0 2.4rem 0 0;
  order: 2;

  @media ${MEDIA.mediumDown} {
    margin: 0 auto 0 0;

    &::after {
      content: none;
    }
  }

  .QRCode {
    border: 2rem solid #ffffff;
    border-radius: var(--border-radius);
    box-sizing: content-box;
    margin: 1rem auto;
  }
`

export const UserWalletItem = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: flex-start;
  white-space: initial;
  letter-spacing: 0;
  flex: 1 1 auto;
  padding: 0;
  box-sizing: border-box;
  margin: 0 0 0 1rem;

  > a {
    line-height: 1;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
  }

  > a > svg {
    margin: 0 0.5rem 0 0;
  }
`

const WalletButton = styled.button`
  border-radius: 3rem;
  color: var(--color-text-CTA);
  font-size: 1.5rem;
  margin: 1.2rem 0;
  padding: 1rem 2rem;
  white-space: nowrap;
  width: auto;
`

export const BlockExplorerButton = styled(WalletButton)`
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

export const LogInOutButton = styled.div<{ $loggedIn?: boolean }>`
  background-image: ${(props): string => (props.$loggedIn ? 'none' : 'var(--color-button-gradient)')};
  color: ${(props): string => (props.$loggedIn ? 'transparent' : 'var(--color-text-primary)')};
  box-sizing: border-box;

  &:hover {
    background-image: ${(props): string => (props.$loggedIn ? 'transparent' : 'var(--color-button-gradient-2)')};
  }

  > a {
    height: 100%;
    font-size: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
  }

  > a > i {
    margin: 0 0.5rem 0 0;
    height: 1.6rem;
    width: 1.9rem;
    object-fit: contain;
    background: url(${walletIMGWhite}) no-repeat center/contain;
  }

  > a > svg {
    margin: 0 0.8rem 0 0;
  }
`

export const ConnectWallet = styled.div`
  font-size: 1.4rem;
  line-height: 1;
  display: flex;
  flex-flow: row nowrap;
  margin: 0;

  > svg {
    margin: 0 0.5rem 0 0;
  }
`

export const UserAddress = styled.div`
  background: transparent;
  display: flex;
  flex-flow: row;
`

export const UserWalletToggler = styled(UserWalletItem)`
  cursor: pointer;
  margin: 0;
  flex-flow: row wrap;
  box-sizing: border-box;
  padding: 0 1rem;
`

export const WalletImage = styled.img`
  width: 1.9rem;
  height: 1.9rem;
  object-fit: contain;
  margin: 0 1rem 0 0;
`

export const CopyDiv = styled.div`
  background: #90ee90ad;
  border-radius: 0.6rem;
  width: 100%;
  font-size: 1.2rem;
  padding: 0.5rem;
  margin: 0 0 1rem;
  text-align: center;

  @media ${MEDIA.mobile} {
    width: 100%;
    width: calc(100% - 3.2rem);
  }
`

export const EtherImage = styled(WalletImage)`
  background: transparent;
`

export const UserWalletSlideWrapper = styled.div`
  background: var(--color-background-pageWrapper);
  padding: 2.6rem 1.6rem;
  box-sizing: border-box;
  z-index: 10;
  flex-flow: column wrap;
  box-shadow: var(--box-shadow-wrapper);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 50vw;
  overflow: hidden;
  align-self: center;
  max-width: 42rem;
  max-height: 90vh;
  display: flex;
  border-radius: 2rem;

  @media ${MEDIA.mobile} {
    width: 100%;
    position: fixed;
    top: 0;
    box-sizing: border-box;
    box-shadow: 0 90vh 0 100vw rgba(47, 62, 78, 0.5);
    border-radius: 1.2rem;
    padding: 0 0 3rem;
  }

  > button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    background: transparent;
    height: 5.4rem;
    align-items: center;
    padding: 0 1.6rem;

    @media ${MEDIA.mediumUp} {
      display: none;
    }
  }

  > button > b {
    color: var(--color-text-primary);
    font-size: 1.6rem;
  }

  > button > i {
    font-style: normal;
    font-size: 4rem;
    font-family: Arial, sans-serif;
    color: #526877;
    font-weight: lighter;
    opacity: 0.5;
  }
`

export const NetworkTitle = styled.div`
  box-sizing: border-box;
  background-color: rgba(243, 132, 30, 0.05);
  color: rgb(243, 132, 30);
  font-weight: var(--font-weight-medium);
  padding: 0.8rem 1.2rem;
  margin: 0 1.2rem 0 -1rem;
  border-radius: inherit;

  &:empty {
    display: none;
  }
`

export const WalletName = styled.div`
  position: absolute;
  top: 100%;
  font-size: 1rem;
`

export const MonospaceAddress = styled.div`
  cursor: pointer;
  margin: 0 0 1.6rem;
  font-family: var(--font-mono);
  font-size: 1.2rem;
  font-weight: var(--font-weight-normal);
  word-break: break-all;
  line-height: 1.4;
  text-align: center;
  width: 90%;

  @media ${MEDIA.mobile} {
    border: solid 0.1rem var(--color-background-banner);
    border-radius: 0.6rem 0.6rem 0 0;
    padding: 1rem;
    box-sizing: border-box;
    width: calc(100% - 3.2rem);
  }

  > b {
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  > svg {
    margin: 0 0 0 0.5rem;
  }
`
