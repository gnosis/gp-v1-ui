import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Wrapper = styled.footer`
  text-align: center;

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
  </Wrapper>
)

export default Footer
