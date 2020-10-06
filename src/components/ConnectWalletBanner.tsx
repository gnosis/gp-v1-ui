import React from 'react'
import styled from 'styled-components'

import iconWallet from 'assets/img/wallet.svg'
import { MEDIA } from 'const'
import { useConnectWallet } from 'hooks/useConnectWallet'

export const Wrapper = styled.div`
  background: var(--color-background-pageWrapper);
  box-shadow: var(--box-shadow-wrapper);
  border-radius: 0.6rem;
  width: 100%;
  min-height: 35rem;
  min-width: 55rem;
  font-size: 1.6rem;
  line-height: 1;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  padding: 1.6rem;
  box-sizing: border-box;
  max-width: 85rem;
  margin: 0 auto;

  @media ${MEDIA.mobile} {
    width: calc(100% - 2.4rem);
    margin: 0 auto;
    min-width: initial;
  }

  > img {
    margin: 0 0 1.6rem;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }

  > h1 {
    color: var(--color-text-primary);
    @media ${MEDIA.mobile} {
      font-size: 2.4rem;
    }
  }

  > p {
    text-align: center;
    line-height: 1.3;

    > a {
      color: var(--color-text-active);
    }
  }
`
export const ConnectWalletBanner: React.FC = () => {
  const { connectWallet } = useConnectWallet()

  return (
    <Wrapper className="widget">
      <img src={iconWallet} alt="Wallet Disconnected" onClick={connectWallet} />
      <h1>Wallet Disconnected</h1>
      <p>
        Please <a onClick={connectWallet}>connect your wallet</a>
      </p>
    </Wrapper>
  )
}
