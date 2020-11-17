import React, { PropsWithChildren } from 'react'
import styled from 'styled-components'

import { MEDIA } from 'const'

export const NavStyled = styled.ol`
  list-style: none;
  display: flex;
  padding: 0;

  @media ${MEDIA.mediumDown} {
    margin: 0 0 0 auto;
  }

  > li {
    font-size: 1.6rem;
    color: var(--color-text-secondary);
    background-color: transparent;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    border-radius: 0.75rem;
    position: relative;
    flex-flow: row;
    display: flex;
  }

  > li.active,
  > li:hover {
    background-color: var(--color-button-primary);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  > li > div {
    border-radius: inherit;
  }

  > li > div > a,
  > li > a {
    font-weight: var(--font-weight-normal);
    font-size: inherit;
    color: inherit;
    text-align: center;
    text-decoration: none;
    padding: 1rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    position: relative;
    font-family: inherit;
    margin: 0;
    border-radius: 0.6rem;
  }

  > li > div > a > i,
  > li > a {
    transition: width 0.3s ease-in-out, background 0.3s ease-in-out;
  }
`

type Props = PropsWithChildren<unknown>

export const Menu: React.FC<Props> = ({ children }) => <NavStyled>{children}</NavStyled>
