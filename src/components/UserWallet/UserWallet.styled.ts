import styled from 'styled-components'

export const UserWalletWrapper = styled.div<{ $walletOpen: boolean }>`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  /* background: var(--color-background-pageWrapper);
  border-radius: ${({ $walletOpen }): string =>
    $walletOpen ? 'var(--border-radius) var(--border-radius) 0 0' : 'var(--border-radius)'};
  box-shadow: var(--box-shadow); */
  line-height: 1;
  text-align: left;
  position: relative;
`

export const UserWalletItem = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  margin: auto;
  white-space: initial;
  font-family: var(--font-mono);
  letter-spacing: 0;
  font-weight: var(--font-weight-medium);
  color: #476481;
  letter-spacing: 0;
`

export const UserAddress = styled.div`
  font-weight: var(--font-weight-medium);
  font-size: 1.6rem;
  color: #476481;
  letter-spacing: 0;
`

export const UserWalletToggler = styled(UserWalletItem)`
  cursor: pointer;
  margin: 0 3rem 0 0;
`
export const EtherImage = styled.img`
  width: 2.6rem;
  height: 2.6rem;
  object-fit: contain;

  @media (prefers-color-scheme: dark) {
    body:not(.light-theme) & {
      filter: invert(100%);
    }
  }

  body.dark-theme & {
    filter: invert(100%);
  }
`

export const CopyDiv = styled.div`
  background: #90ee90ad;
  border-radius: var(--border-radius);
  width: 60%;
`

export const UserWalletSlideWrapper = styled.div`
  position: absolute;
  background: inherit;
  width: 100%;
  top: 100%;
  left: 0;
  box-shadow: var(--box-shadow);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  z-index: 2;
`

export const NetworkTitle = styled.div`
  color: inherit;
  position: absolute;
  text-transform: uppercase;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.3rem;
  top: -0.6rem;
`

export const MonospaceAddress = styled(NetworkTitle)`
  margin: 0 0.625rem;
  font-family: 'monospace';
  font-size: 85%;
  font-weight: lighter;
  word-break: break-all;
`
