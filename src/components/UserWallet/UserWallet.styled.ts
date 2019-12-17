import styled from 'styled-components'

export const UserWalletWrapper = styled.div<{ $walletOpen: boolean }>`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  margin: 1rem;
  padding: 6px 13px;

  background: ghostwhite;
  border-radius: ${({ $walletOpen }): string => ($walletOpen ? '10px 10px 0 0' : '10px')};

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
`

export const UserWalletToggler = styled(UserWalletItem)`
  cursor: pointer;
  padding: 6px;
`
export const EtherImage = styled.img`
  max-width: 10%;
`

export const CopyDiv = styled.div`
  background: #90ee90ad;
  border-radius: 50px;
  font-size: 75%;
  width: 80%;
`

export const UserWalletSlideWrapper = styled.div`
  position: absolute;
  background: inherit;
  width: 100%;
  top: 100%;
  left: 0;
  box-shadow: var(--box-shadow);
  border-radius: 0 0 10px 10px;
  z-index: 2;
`

export const NetworkTitle = styled.div<{ $color?: string; $fontSize?: string }>`
  color: ${({ color = '#000' }): string => color};
  font-size: ${({ $fontSize = '1.15rem' }): string => $fontSize};
  font-weight: 800;
`

export const MonospaceAddress = styled(NetworkTitle)`
  margin: 0 10px;
  font-family: 'monospace';
  font-size: 85%;
  font-weight: 100;
  word-break: break-all;
`
