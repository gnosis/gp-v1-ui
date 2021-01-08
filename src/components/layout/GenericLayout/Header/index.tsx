import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

// Assets
import LogoImage from 'assets/img/logo-v2.svg'

const HeaderStyled = styled.header`
  height: var(--height-bar-default);
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 2rem;
  border-bottom: 0.1rem solid var(--color-border);
  background: var(--color-primary);
`

const Logo = styled(Link)`
  width: auto;
  height: 76%;
  transform: perspective(20rem) rotateY(0);
  transform-style: preserve-3d;
  transition: transform 1s ease-in-out;
  padding: 0;
  margin: 0 1.6rem 0 0;
  display: flex;
  align-content: center;
  justify-content: center;

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
    margin: auto;
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
    <Logo to="/" href="#">
      <img src={LogoImage} alt="Trading interface homepage" />
    </Logo>
    {menu}
    {tools}
  </HeaderStyled>
)
