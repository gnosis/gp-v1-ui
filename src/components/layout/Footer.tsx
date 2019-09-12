import * as React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Wrapper = styled.footer`
  text-align: center;
  position: relative;
  color: var(--color-text-secondary);

  ul {
    margin: 0;
    padding: 0;
    //background-color: red;
    height: 100%;
    display: flex;
    list-style-type: none;
    justify-content: center;
    white-space: nowrap;
    margin-bottom: 2rem;
  }

  li {
    margin: 0 1rem;
    a {
      color: var(--color-text-secondary);
    }
  }

  .version {
    position: absolute;
    top: 0;
    right: 0;
    margin-right: 3em;
    font-size: 0.85em;
  }
`

const Footer: React.FC = () => (
  <Wrapper>
    <ul>
      <li>
        <Link to="/about">About dFusion</Link>
      </li>
      <li>
        <Link to="/source-code">Source code</Link>
      </li>
    </ul>
    <div className="version">dFusion PoC v{VERSION}</div>
  </Wrapper>
)

export default Footer
