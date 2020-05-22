import React from 'react'
import styled from 'styled-components'
import { ContentPage } from 'components/Layout/PageWrapper'
import addressesByNetwork from 'api/deposit/batchExchangeAddresses'
import { getNetworkFromId } from '@gnosis.pm/dex-js'
import { EtherscanLink } from 'components/EtherscanLink'

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

  .contract-addresses {
    font-size: 0.85em;
    a {
      margin-left: 0;
    }
  }
`

const About: React.FC = () => {
  const ContractAddresses = Object.entries(addressesByNetwork).map(([networkIdString, address], index) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const networkId = +networkIdString!
    return (
      <React.Fragment key={address}>
        {index > 0 && <span>, </span>}
        <EtherscanLink type="contract" identifier={address} networkId={networkId} label={getNetworkFromId(networkId)} />
      </React.Fragment>
    )
  })
  return (
    <AboutWrapper>
      <h1>About Mesa</h1>
      <p>
        Mesa it&apos;s an Open Source interface for{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://docs.gnosis.io/protocol">
          Gnosis Protocol
        </a>
        .<br />
        <div id="code-link">
          Check out the{' '}
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/gnosis/dex-react">
            Source Code
          </a>{' '}
          and{' '}
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/gnosis/dex-react/releases">
            Releases
          </a>
          .
        </div>
      </p>
      <p>
        <strong>Gnosis Protocol</strong> is a fully permissionless DEX that enables ring trades to maximize liquidity.
        <a target="_blank" rel="noopener noreferrer" href="https://docs.gnosis.io/protocol">
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
          </a>{' '}
          <span className="contract-addresses">({ContractAddresses})</span>
        </li>
        <li>
          dex-js library:&nbsp;
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={'https://github.com/gnosis/dex-js/tree/v' + DEX_JS_VERSION}
          >
            v{DEX_JS_VERSION}
          </a>
        </li>
      </ul>

      <h2>Learn more about Gnosis Protocol</h2>
      <ul>
        <li>
          Developer portal:{' '}
          <a target="_blank" rel="noopener noreferrer" href="https://docs.gnosis.io/protocol">
            https://docs.gnosis.io/protocol
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
          <a target="_blank" rel="noopener noreferrer" href="https://thegraph.com/explorer/subgraph/gnosis/protocol">
            https://thegraph.com/explorer/subgraph/gnosis/protocol
          </a>
        </li>
        <li>
          Protocol info:{' '}
          <a target="_blank" rel="noopener noreferrer" href="https://duneanalytics.com/gnosisprotocol">
            Dune analytics: Gnosis Protocol
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
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/gnosis/dex-price-estimator">
            @gnosis/dex-price-estimator
          </a>
        </li>
      </ul>
    </AboutWrapper>
  )
}

export default About
