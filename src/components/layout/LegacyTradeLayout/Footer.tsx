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
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'

// Hooks
import { useWalletConnection } from 'hooks/useWalletConnection'

const Wrapper = styled.footer`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: transparent;
  font-weight: var(--font-weight-normal);
  font-size: 1.3rem;
  color: var(--color-text-primary);
  letter-spacing: -0.03rem;
  line-height: 1;

  width: 100%;
  margin: 0 0 4rem 0;
  padding: 0 2rem;

  @media ${MEDIA.mobile} {
    flex-flow: column wrap;
    width: 100%;
    padding: 0 0 5.4rem;
    margin: 0;
  }
`

const FooterLinks = styled.div`
  > a {
    margin: 0 0.5rem;
  }

  > a:link,
  > a:visited {
    font-family: var(--font-weight-normal);
    font-size: inherit;
    color: inherit;
    letter-spacing: -0.03rem;
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
  flex: 1 1 100%;
  justify-content: center;

  margin: 0 1rem;
  padding: 0;

  > a {
    height: fit-content;
    margin: auto 0;
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
  flex-flow: row wrap-reverse;
  flex: 1 1 100%;
  align-items: center;
  justify-content: space-around;

  margin: 0 2rem;

  > ${ThemeTogglerWrapper}, > ${FooterLinks}, > .version {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    flex: 1 0;

    font-size: inherit;
    margin: 1.2rem 0;
    white-space: nowrap;

    > strong {
      margin-right: 1rem;
    }
  }

  > ${ThemeTogglerWrapper} {
    order: 1;
  }

  > ${FooterLinks} {
    order: 2;
  }

  > .version {
    order: 3;
    font-size: inherit;
    color: inherit;

    > a {
      margin: 0 0.4rem;
      color: inherit;
      text-decoration: underline;
      transition: color 0.2s ease-in-out;
    }

    > a:hover {
      color: var(--color-text-active);
    }
  }

  @media only screen and (max-width: ${MEDIA.mediumScreenSmall}) {
    > ${FooterLinks}, > .version,
    > ${ThemeTogglerWrapper} {
      flex: 1 1 100%;
    }

    > ${FooterLinks} {
      order: 3;
      margin: 4rem 0;
    }

    > ${ThemeTogglerWrapper} {
      order: 2;
    }

    > .version {
      order: 1;
    }
  }

  @media ${MEDIA.xSmallDown} {
    > .version {
      flex-flow: column nowrap;

      > a {
        margin: 0.5rem 0;

        &:first-child {
          order: 5;
        }
      }
    }
  }
`

const LinkWrapper = styled(BlockExplorerLink)`
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
        {/* LINKS */}
        <FooterLinks>
          <Link to="/about">About{APP_NAME_ABOUT}</Link>
          <Link to="/faq">FAQ</Link>
        </FooterLinks>
        {/* VERSION */}
        <div className="version">
          <a target="_blank" rel="noopener noreferrer" href={'https://github.com/gnosis/gp-v1-ui/tree/v' + VERSION}>
            Web: v{VERSION}
          </a>{' '}
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/gnosis/gp-v1-ui/wiki/App-Ids-for-Forks">
            App Id: {CONFIG.appId}
          </a>{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={'https://github.com/gnosis/dex-contracts/tree/v' + CONTRACT_VERSION}
          >
            Contracts: v{CONTRACT_VERSION}
          </a>
        </div>
      </SideContentWrapper>
    </Wrapper>
  )
}

export default Footer
