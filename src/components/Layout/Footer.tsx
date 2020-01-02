import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import ThemeToggler from 'components/ThemeToggler'

const Wrapper = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  background: var(--color-background);
  z-index: 2000;

  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  padding 1.3em;
  text-align: center;
  
  color: var(--color-text-secondary);
  font-size: 0.85rem;

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
    <ThemeToggler />
    <div className="footerLinks">
      <div>
        <Link to="/about">About dFusion</Link>
      </div>
      <div>
        <Link to="/source-code">Source code</Link>
      </div>
    </div>
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
