import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import ThemeToggler from 'components/ThemeToggler'

const Wrapper = styled.footer`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  padding: 1.3rem;
  text-align: center;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 1.3rem;
  max-width: 85rem;
  margin: 0 auto;

  > div {
    margin: 0.2rem auto;
    flex: 1 1 15rem;
  }

  > .footerLinks {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;

    > div {
      margin: 0 0.5rem;
    }
  }

  .version {
    font-size: 0.85em;
    a {
      text-decoration: none;
    }
  }
`

const Footer: React.FC = () => (
  <Wrapper>
    {/* DARK/LIGHT MODE TOGGLER */}
    <ThemeToggler />
    {/* LINKS */}
    <div className="footerLinks">
      <div>
        <Link to="/about">About dFusion</Link>
      </div>
      <div>
        <Link to="/source-code">Source code</Link>
      </div>
    </div>
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
