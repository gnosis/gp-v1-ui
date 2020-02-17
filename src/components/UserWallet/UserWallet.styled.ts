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
  text-align: center;
  width: 15rem;
  position: relative;
  margin: 0 3rem 0 0;
`

export const UserWalletItem = styled.div<{ $padding?: string; $wordWrap?: string }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  margin: auto;
  white-space: ${({ $wordWrap = 'initial' }): string => $wordWrap};
  font-family: var(--font-mono);
  letter-spacing: 0;

  > div {
    font-weight: var(--font-weight-medium);
    font-size: 1.6rem;
    color: #476481;
    letter-spacing: 0;
  }

  > svg {
    width: 70%;
    height: auto;
  }
`

export const UserWalletToggler = styled(UserWalletItem)`
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.375rem;
`
export const EtherImage = styled.img`
  max-width: 5%;

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
  font-size: 75%;
  padding: 0.375rem;
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

export const NetworkTitle = styled.div<{ $color?: string; $fontSize?: string }>`
  /* color: ${({ color = 'var(--color-text-primary)' }): string => color};
  font-size: ${({ $fontSize = '1rem' }): string => $fontSize};
  font-weight: bolder; */
  color: inherit;
  position: absolute;
  text-transform: uppercase;
  font-size: .9rem;
  text-transform: uppercase;
  letter-spacing: .3rem;
  top: -.6rem;
`

export const MonospaceAddress = styled(NetworkTitle)`
  margin: 0 0.625rem;
  font-family: 'monospace';
  font-size: 85%;
  font-weight: lighter;
  word-break: break-all;
`
