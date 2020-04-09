import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import ThemeToggler from 'components/ThemeToggler'
import { MEDIA } from 'const'
import { depositApi } from 'api'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { EtherscanLink } from 'components/EtherscanLink'
import verified from 'assets/img/verified.svg'

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
  max-width: 85rem;
  margin: 0 auto;
  line-height: 1;

  @media ${MEDIA.mobile} {
    flex-flow: column wrap;
    width: 100%;
    padding: 0 0 5.4rem;
  }

  .version {
    font-size: inherit;
    color: inherit;
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
`

const FooterLinks = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  font-size: inherit;
  margin: 0 6rem 0 0;

  @media ${MEDIA.mobile} {
    width: 100%;
    padding: 0 0 2.4rem;
    margin: 0;
  }

  > a:link,
  > a:visited {
    font-family: var(--font-weight-normal);
    font-size: inherit;
    color: inherit;
    letter-spacing: -0.03rem;
    margin: 0 1.6rem 0 0;
  }

  > a:last-of-type {
    margin: 0;
  }
`

const VerifiedContractLink = styled.div`
  display: flex;
  width: 100%;
  margin: 3rem auto;
  justify-content: center;
  padding: 0;

  > a:link,
  > a:visited {
    color: #29a745;
    transition: border-color 0.2s ease-in-out;
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

const Footer: React.FC = () => {
  const { networkIdOrDefault: networkId } = useWalletConnection()
  const contractAddress = depositApi.getContractAddress(networkId)

  return (
    <Wrapper>
      {/* DARK/LIGHT MODE TOGGLER */}
      <ThemeToggler />
      {/* LINKS */}
      <FooterLinks>
        <Link to="/about">About Mesa</Link>
        <Link to="/faq">FAQ</Link>
      </FooterLinks>
      {/* VERSION */}
      <div className="version">
        Web{' '}
        <a target="_blank" rel="noopener noreferrer" href={'https://github.com/gnosis/dex-react/tree/v' + VERSION}>
          v{VERSION}
        </a>{' '}
        - Contracts{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={'https://github.com/gnosis/dex-contracts/tree/v' + CONTRACT_VERSION}
        >
          v{CONTRACT_VERSION}
        </a>
      </div>
      <VerifiedContractLink>
        {contractAddress && networkId ? (
          <LinkWrapper type="contract" identifier={contractAddress} networkId={networkId} label={VerifiedText} />
        ) : (
          ''
        )}
      </VerifiedContractLink>
    </Wrapper>
  )
}

export default Footer
