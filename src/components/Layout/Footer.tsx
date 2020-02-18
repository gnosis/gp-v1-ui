import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import ThemeToggler from 'components/ThemeToggler'
import { MEDIA } from 'const'

const Wrapper = styled.footer`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  text-align: center;
  background: transparent;
  font-weight: var(--font-weight-normal);
  font-size: 1.3rem;
  color: #476481;
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
      color: #218dff;
    }
  }
`

const FooterLinks = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  font-size: inherit;

  @media ${MEDIA.mobile} {
    width: 100%;
    padding: 0 0 2.4rem;
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

const Footer: React.FC = () => (
  <Wrapper>
    {/* DARK/LIGHT MODE TOGGLER */}
    <ThemeToggler />
    {/* LINKS */}
    <FooterLinks>
      <Link to="/about">About dFusion</Link>
      <Link to="/source-code">View Source Code</Link>
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
  </Wrapper>
)

export default Footer
