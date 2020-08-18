import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { MEDIA } from 'const'
import { depositApi } from 'api'

// Assets
import verified from 'assets/img/verified.svg'
import builtOnGP from 'assets/img/builtOnGP.svg'

// Components
import ThemeToggler, { ThemeTogglerWrapper } from 'components/ThemeToggler'
import { EtherscanLink } from 'components/EtherscanLink'

// Hooks
import { useWalletConnection } from 'hooks/useWalletConnection'

const Wrapper = styled.footer`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  padding: 0;
  text-align: center;
  background: transparent;
  font-weight: var(--font-weight-normal);
  font-size: 1.3rem;
  color: var(--color-text-primary);
  letter-spacing: -0.03rem;
  line-height: 1;

  width: 85%;
  margin: 2rem auto;
  padding: 0 0 2.4rem;

  @media ${MEDIA.mobile} {
    flex-flow: column wrap;
    width: 100%;
    padding: 0 0 5.4rem;
    margin: 0;
  }
`

const FooterLinks = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  font-size: inherit;
  margin: 0 1rem;

  white-space: nowrap;

  > strong {
    margin-right: 1rem;
  }

  @media ${MEDIA.mobile} {
    width: 100%;
    padding: 0 0 1.4rem;
    margin: 0;
  }

  > a:link,
  > a:visited {
    font-family: var(--font-weight-normal);
    font-size: inherit;
    color: inherit;
    letter-spacing: -0.03rem;
    margin: 0 1rem 0 0;
  }

  > a:last-of-type {
    margin: 0;
  }
`

const BuiltOnGPWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;

  &::before {
    content: '';
    background: url(${builtOnGP}) no-repeat center/contain;
    height: 6.6rem;
    width: 6.6rem;
    display: block;
    margin: 1rem;
  }
`

const VerifiedContractLink = styled.div`
  display: flex;
  width: auto;
  margin: 0 1rem;
  justify-content: center;
  padding: 0;

  > a {
    height: fit-content;
    margin: auto;
    border-color: #29a745;
    white-space: nowrap;
  }

  > a:link,
  > a:visited {
    color: #29a745;
    transition: border-color 0.2s ease-in-out;
  }
`

const SideContentWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  flex: 0 1 80.4rem;
  align-items: center;
  justify-content: center;

  @media ${MEDIA.mobile} {
    flex: 0 1 auto;
  }

  > ${ThemeTogglerWrapper} {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 1 20rem;
    margin: 2rem 0;
    white-space: nowrap;
  }

  > div.innerWrapper {
    display: flex;
    flex-flow: row wrap;
    flex: 0 1 59.6rem;
    align-items: center;
    justify-content: space-evenly;

    width: 100%;
    margin: 2rem 0;
    white-space: nowrap;

    > .version {
      margin: 0 1rem;
      font-size: inherit;
      color: inherit;
      white-space: nowrap;

      > strong {
        margin-right: 1rem;
      }

      > a {
        text-decoration: none;
        color: inherit;
        text-decoration: underline;
        transition: color 0.2s ease-in-out;
      }

      > a:hover {
        color: var(--color-text-active);
      }
    }
  }
`

const LinkWrapper = styled(EtherscanLink)`
  margin: 0;
  text-align: center;
  border: 0.1rem solid #c5d3e0;
  font-weight: var(--font-weight-bold);
  font-size: 13px;
  color: inherit;
  letter-spacing: 0;
  text-decoration: none;
  padding: 1.4rem 2rem;
  box-sizing: border-box;
  border-radius: 6rem;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    border: 0.1rem solid #29a745;
  }

  &::before {
    content: '';
    background: url(${verified}) no-repeat center/contain;
    height: 1.6rem;
    width: 1.6rem;
    display: block;
    margin: 0 0.5rem 0 0;
  }
`

const VerifiedText = 'View verified contract'
const APP_NAME_ABOUT = CONFIG.name.length < 5 ? ' ' + CONFIG.name : ''

const Footer: React.FC = () => {
  const { networkIdOrDefault: networkId } = useWalletConnection()
  const contractAddress = depositApi.getContractAddress(networkId)

  return (
    <Wrapper>
      <VerifiedContractLink>
        <BuiltOnGPWrapper />
        {contractAddress && networkId ? (
          <LinkWrapper type="contract" identifier={contractAddress} networkId={networkId} label={VerifiedText} />
        ) : (
          ''
        )}
      </VerifiedContractLink>
      <SideContentWrapper>
        {/* DARK/LIGHT MODE TOGGLER */}
        <ThemeToggler />
        <div className="innerWrapper">
          {/* LINKS */}
          <FooterLinks>
            <strong>General information:</strong>
            <Link to="/about">About{APP_NAME_ABOUT}</Link>
            <Link to="/faq">FAQ</Link>
          </FooterLinks>
          {/* VERSION */}
          <div className="version">
            <strong>App information:</strong>
            <a target="_blank" rel="noopener noreferrer" href={'https://github.com/gnosis/dex-react/tree/v' + VERSION}>
              Web v{VERSION}
            </a>{' '}
            -{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/gnosis/dex-react/wiki/App-Ids-for-Forks"
            >
              App Id: {CONFIG.appId}
            </a>{' '}
            -{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={'https://github.com/gnosis/dex-contracts/tree/v' + CONTRACT_VERSION}
            >
              Contracts v{CONTRACT_VERSION}
            </a>
          </div>
        </div>
      </SideContentWrapper>
    </Wrapper>
  )
}

export default Footer
