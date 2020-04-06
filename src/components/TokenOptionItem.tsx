import React from 'react'
import { isAddress } from 'web3-utils'
import { TokenImgWrapper } from './TokenImg'
import { tokenListApi } from 'api'
import styled from 'styled-components'

const OptionItemWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  text-align: initial;

  img {
    width: 3.6rem;
    height: 3.6rem;
    object-fit: contain;
    margin: 0;
  }

  .tokenDetails {
    display: flex;
    justify-content: space-between;
    width: inherit;

    .tokenName {
      display: flex;
      flex-direction: column;
      margin-left: 1rem;
    }
  }

  > div > div {
    font-weight: var(--font-weight-normal);
    font-size: 1.3rem;
    color: #476481;
    line-height: 1.1;
  }

  > div > div > strong {
    font-weight: var(--font-weight-bold);
    margin: 0;
    font-size: 1.6rem;
  }
`

interface OptionItemProps {
  image?: string
  name?: string
  symbol?: string
  children?: React.ReactNode
}

const OptionItemBase: React.FC<OptionItemProps> = ({ image, name, symbol, children }) => {
  return (
    <OptionItemWrapper>
      <TokenImgWrapper src={image} alt={name} />
      <div className="tokenDetails">
        <div className="tokenName">
          <div>
            <strong>{symbol}</strong>
          </div>
          <div>{name}</div>
        </div>
        {children}
      </div>
    </OptionItemWrapper>
  )
}

export const OptionItem = React.memo(OptionItemBase)

interface SearchItemProps {
  value: string
  defaultText?: string
  networkId: number
}

const testPAXG = {
  address: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
  symbol: 'PAXG',
  name: 'Paxos Gold',
  decimals: 18,
  id: 17,
  image:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x45804880De22913dAFE09f4980848ECE6EcbAf78/logo.png',
}

export const SearchItem: React.FC<SearchItemProps> = ({ value, defaultText, networkId }) => {
  if (!value || tokenListApi.hasToken({ tokenAddress: value, networkId }) || !isAddress(value.toLowerCase())) {
    return <>{defaultText}</>
  }

  return <OptionItem {...testPAXG} />
}
