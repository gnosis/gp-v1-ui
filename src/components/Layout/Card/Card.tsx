import React from 'react'
import styled from 'styled-components'
import { RESPONSIVE_SIZES } from 'const'

export const CardTable = styled.table<{
  $bgColor?: string

  $headerGap?: string
  $columns?: string
  $rows?: string
  $gap?: string
  $cellSeparation?: string
  $rowSeparation?: string

  $align?: string
  $justify?: string

  $responsiveCSS?: string
  $webCSS?: string
}>`
  display: grid;
  grid-gap: ${({ $headerGap = '0.3rem' }): string => $headerGap};
  width: 100%;

  tbody > tr:hover {
    background: var(--color-background-selected);
  }

  > thead, tbody {
    > tr {
      display: grid;
      grid-template-columns: ${({ $columns }): string => $columns || `repeat(auto-fit, minmax(3rem, 1fr))`};
      // grid-template-rows
      ${({ $rows }): string => ($rows ? `grid-template-rows: ${$rows};` : '')}
      // grid-gap
      ${({ $gap }): string => ($gap ? `grid-gap: ${$gap};` : '')}
      align-items: ${({ $align = 'center' }): string => $align};
      justify-content: ${({ $justify = 'center' }): string => $justify};

      background-color: ${({ $bgColor = 'var(--color-background-pageWrapper)' }): string => $bgColor};
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);

      // How much separation between ROWS
      margin: ${({ $rowSeparation = '1rem' }): string => `${$rowSeparation} 0`};

      text-align: center;
      transition: all 0.2s ease-in-out;
      z-index: 1;
      
      // Separation between CELLS
      > * {
        margin: ${({ $cellSeparation = '0 0.5rem' }): string => $cellSeparation};
      }
    }
  }

  > thead > tr {
    background-color: transparent;
    box-shadow: none;
  }

  > tbody > tr {
    > td {
      &.cardOpener {
        display: none;
      }
    }
  }
  // Top level custom CSS
  ${({ $webCSS }): string | undefined => $webCSS}

  @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
    > thead, tbody {
      > tr {
        grid-template-columns: none;
        grid-template-rows: auto;

        align-items: center;
        justify-content: stretch;
        padding: 0 0.7rem;
        
        > td {
          display: flex;
          flex-flow: row;
          align-items: center;
          border-bottom: 0.0625rem solid #00000024;
          padding: 0.7rem;

          &:last-child {
            border: none;
          }

          &.cardOpener {
            cursor: pointer;
            display: initial;
          }

          &::before {
            content: attr(data-label);
            margin-right: auto;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.7rem;
          }
        }
  
        &.selected {
          > td {
            border-bottom: 0.0625rem solid #ffffff40;
          }
        }
      }
    }
    
    // Hide Table Header on smaller sizes
    > thead {
      display: none;
    }

    // Top level custom css
    ${({ $responsiveCSS }): string | undefined => $responsiveCSS}
  }
`

const fakeData = [
  { a: 1, b: 2, c: 3 },
  { a: 1, b: 2, c: 3 },
  { a: 1, b: 2, c: 3 },
]

const webCSS = `
  background: lightsalmon;
  min-height: 4rem;
`
const responsiveCSS = `
  background: lightyellow;
  color: #000;
`
export const Test: React.FC = () => (
  <CardTable $columns="repeat(3, 1fr)" $bgColor="lightgrey" $webCSS={webCSS} $responsiveCSS={responsiveCSS}>
    <thead>
      <tr>
        <th>One</th>
        <th>Two</th>
        <th>Three</th>
      </tr>
    </thead>
    <tbody>
      {fakeData.map((item, index) => (
        <tr key={index + Math.random()}>
          <div data-label="Yo">{item.a}</div>
          <div data-label="Labels">{item.b}</div>
          <div data-label="AreDope">{item.c}</div>
        </tr>
      ))}
    </tbody>
  </CardTable>
)
