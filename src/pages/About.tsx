import React from 'react'
import styled from 'styled-components'
import { ContentPage } from 'components/Layout/PageWrapper'

export const AboutWrapper = styled(ContentPage)`
  line-height: 2.2rem;

  a {
    display: inline-block;
    margin-left: 0.3rem;
  }

  div#code-link {
    color: gray;
    margin-left: 2rem;
    font-size: 1.2rem;
  }
`

const About: React.FC = () => (
  <AboutWrapper>
    <h1>About Mesa</h1>
    <p>
      Mesa it&apos;s an Open Source interface for{' '}
      <a target="_blank" rel="noopener noreferrer" href="https://docs.gnosis.io/dfusion">
        Gnosis Protocol
      </a>
      .<br />
      <div id="code-link">
        Check out the <a href="https://github.com/gnosis/dex-react">Source Code</a> and{' '}
        <a href="https://github.com/gnosis/dex-react/releases">Releases</a>.
      </div>
    </p>
    <p>
      <strong>Gnosis Protocol</strong> introduces a new, fully decentralized exchange mechanism for ERC20 tokens with
      the following properties:
      <ul>
        <li>Batch auctions</li>
        <li>Multidimensional order books with ring trades</li>
        <li>Uniform clearing prices in every batch</li>
      </ul>
      <a target="_blank" rel="noopener noreferrer" href="https://docs.gnosis.io/dfusion">
        Read more here
      </a>
    </p>

    <h2>Versions:</h2>
    <ul>
      <li>
        Mesa:&nbsp;
        <a target="_blank" rel="noopener noreferrer" href={'https://github.com/gnosis/dex-react/tree/v' + VERSION}>
          v{VERSION}
        </a>{' '}
      </li>
      <li>
        Smart Contract:&nbsp;
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={'https://github.com/gnosis/dex-contracts/tree/v' + CONTRACT_VERSION}
        >
          v{CONTRACT_VERSION}
        </a>
      </li>
      <li>
        dex-js library:&nbsp;
        <a target="_blank" rel="noopener noreferrer" href={'https://github.com/gnosis/dex-js/tree/v' + DEX_JS_VERSION}>
          v{DEX_JS_VERSION}
        </a>
      </li>
    </ul>

    <h2>Learn more about Gnosis Protocol</h2>
    <ul>
      <li>
        dFusion Paper:{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/gnosis/dex-research/blob/master/dFusion/dfusion.v1.pdf"
        >
          dfusion.v1.pdf
        </a>
      </li>
      <li>
        Developer portal:{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://docs.gnosis.io/dfusion">
          https://docs.gnosis.io/dfusion
        </a>
      </li>
      <li>
        Smart Contracts:{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/gnosis/dex-contracts">
          @gnosis/dex-contracts
        </a>
      </li>
    </ul>

    <h2>Tools</h2>
    <ul>
      <li>
        CLI <small>(Command Line Interface)</small>:{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/gnosis/dex-cli">
          @gnosis/dex-cli
        </a>
      </li>
      <li>
        Subgraph API:{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://thegraph.com/explorer/subgraph/gnosis/dfusion">
          https://thegraph.com/explorer/subgraph/gnosis/dfusion
        </a>
      </li>

      <li>
        Open Solver:{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/gnosis/dex-open-solver">
          @gnosis/dex-open-solver
        </a>
      </li>

      <li>
        Telegram bot:{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/gnosis/dex-telegram">
          @gnosis/dex-telegram
        </a>
      </li>

      <li>
        Visualization tools:{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/gnosis/dex-visualization-tools">
          @gnosis/dex-visualization-tools
        </a>
      </li>

      <li>
        Price Estimator:{' '}
        <a target="_blank" rel="noopener noreferrer" href="dex-price-estimator">
          dex-price-estimator
        </a>
      </li>
    </ul>
  </AboutWrapper>
)

export default About
