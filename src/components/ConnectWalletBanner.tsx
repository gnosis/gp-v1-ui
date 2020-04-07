import React from 'react'
import styled from 'styled-components'

import iconWallet from 'assets/img/wallet.svg'
import { MEDIA } from 'const'
import { useConnectWallet } from 'hooks/useConnectWallet'

export const Wrapper = styled.div`
  background: var(--color-background-pageWrapper);
  box-shadow: 0 -1rem 4rem 0 rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02) 0 0.276726rem 0.221381rem 0,
    rgba(0, 0, 0, 0.027) 0 0.666501rem 0.532008rem 0, rgba(0, 0, 0, 0.035) 0 1.25216rem 1.0172rem 0,
    rgba(0, 0, 0, 0.043) 0 2.23363rem 1.7869rem 0, rgba(0, 0, 0, 0.05) 0 4.17776rem 3.34221rem 0,
    rgba(0, 0, 0, 0.07) 0 10rem 8rem 0;
  border-radius: 0.6rem;
  width: 100%;
  min-height: 35rem;
  min-width: 55rem;
  display: flex;
  flex-flow: row nowrap;
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
