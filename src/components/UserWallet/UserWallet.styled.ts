import styled from 'styled-components'

export const UserWalletWrapper = styled.div<{ $walletOpen: boolean }>`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  margin: 1rem;
  padding: 6px 13px;

  background: var(--color-background-pageWrapper);
  border-radius: ${({ $walletOpen }): string =>
    $walletOpen ? 'var(--border-radius) var(--border-radius) 0 0' : 'var(--border-radius)'};
  box-shadow: var(--box-shadow);
  line-height: 1;
  text-align: center;
`

export const UserWalletItem = styled.div<{ $padding?: string; $wordWrap?: string }>`
  color: #000;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  margin: auto;
  padding: ${({ $padding = '1rem 0.2rem' }): string => $padding};
  width: 92%;

  white-space: ${({ $wordWrap = 'initial' }): string => $wordWrap};

  > * {
    margin: 0 6px;
  }

  > svg {
    width: 70%;
    height: auto;
  }
`

export const UserWalletToggler = styled(UserWalletItem)`
  cursor: pointer;
  font-size: 0.8rem;
  padding: 6px;
`
export const EtherImage = styled.img`
  max-width: 5%;
`

export const CopyDiv = styled.div`
  background: #90ee90ad;
  border-radius: var(--border-radius);
  font-size: 75%;
  padding: 5px;
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
  color: ${({ color = '#000' }): string => color};
  font-size: ${({ $fontSize = '1rem' }): string => $fontSize};
  font-weight: bolder;
`

export const MonospaceAddress = styled(NetworkTitle)`
  margin: 0 10px;
  font-family: 'monospace';
  font-size: 85%;
  font-weight: lighter;
  word-break: break-all;
`
