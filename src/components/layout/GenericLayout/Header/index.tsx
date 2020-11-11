import React from 'react'
import styled from 'styled-components'

// Assets
import LogoImage from 'assets/img/logo-v2.svg'

const HeaderStyled = styled.header`
  height: 6.2rem;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 2rem;
  border: 0.1rem solid var(--color-border);
`

const Logo = styled.a`
  width: auto;
  height: 3rem;
  transform: perspective(20rem) rotateY(0);
  transform-style: preserve-3d;
  transition: transform 1s ease-in-out;
  padding: 0;
  margin: 0 1.6rem 0 0;

  &:hover {
    animation-name: spin;
    animation-duration: 4s;
    animation-iteration-count: infinite;
    animation-delay: 0.3s;
  }

  > img {
    background: url(${LogoImage}) no-repeat center/contain;
    border: 0;
    object-fit: contain;
    width: inherit;
    height: inherit;
  }

  @keyframes spin {
    0% {
      transform: perspective(20rem) rotateY(0);
    }
    30% {
      transform: perspective(20rem) rotateY(200deg);
    }
    100% {
      transform: perspective(20rem) rotateY(720deg);
    }
  }
`

interface Props {
  menu?: React.ReactNode
  tools?: React.ReactNode
}

export const Header: React.FC<Props> = ({ menu, tools }) => (
  <HeaderStyled>
    <Logo href="#">
      <img src={LogoImage} />
    </Logo>
    {menu}
    {tools}
  </HeaderStyled>
)
