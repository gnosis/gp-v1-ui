import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import ThemeToggler from 'components/ThemeToggler'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons'

const Wrapper = styled.footer<{ $fixed?: boolean; $open: boolean }>`
  position: ${({ $fixed }): string => ($fixed ? 'fixed' : 'relative')};
  height: ${({ $open = true }): string => ($open ? 'auto' : '0px')};
  margin-bottom: ${({ $fixed }): string => ($fixed ? '0' : '-5rem')};
  bottom: 0;
  width: 100%;
  z-index: 2000;

  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  padding: 1.3rem;
  text-align: center;

  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: 0.85rem;

  > div {
    margin: 0.2rem auto;
    flex: 1 1 15rem;
    opacity: ${({ $open }): string => ($open ? '1' : '0')};
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

const FooterToggler = styled.a`
  position: absolute;
  right: 1rem;
  top: 0.73rem;
  cursor: pointer;
`

interface FooterProps {
  fixedFooter?: boolean
}

const Footer: React.FC<FooterProps> = ({ fixedFooter }: FooterProps) => {
  const [footerOpen, setFooterOpen] = useState(true)
  return (
    <Wrapper $fixed={fixedFooter} $open={footerOpen}>
      {/* FOOTER ACTION HANDLER */}
      {fixedFooter && (
        <FooterToggler onClick={(): void => setFooterOpen(!footerOpen)}>
          <FontAwesomeIcon size="lg" icon={footerOpen ? faChevronCircleDown : faChevronCircleUp} />
        </FooterToggler>
      )}
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
}

export default Footer
