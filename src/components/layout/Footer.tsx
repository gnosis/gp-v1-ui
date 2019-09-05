import React from 'react'
import styled from 'styled-components'

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
        <li><a href="#">About dFusion</a></li>
        <li><a href="#">Source code</a></li>
      </ul>
    </Wrapper>
)

export default Footer
