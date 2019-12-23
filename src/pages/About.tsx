import React from 'react'
import PageWrapper from 'components/Layout/PageWrapper'

const About: React.FC = () => (
  <PageWrapper>
    <h1>About dFusion</h1>
    <p>
      The dFusion PoC protocol (working title) introduces a new, fully decentralized exchange mechanism for ERC20
      tokens: batch-auctions with multidimensional order books (in the form of ring trades) with uniform clearing prices
      in every batch. <br />
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://docs.google.com/document/d/1GjDX1_2RsCCxtwnjBgXaV6yXJ2AXYL4-EEYv7HjptaM/edit"
      >
        Read more here
      </a>
    </p>
    <p>Versions used in this web:</p>
    <ul>
      <li>
        Web:&nbsp;
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
  </PageWrapper>
)

export default About
