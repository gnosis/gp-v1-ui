import React from 'react'
import styled from 'styled-components'
import { MEDIA } from 'const'

const CardRowDrawer = styled.tr<{ responsive: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  box-shadow: none;

  // Inner td wrapper
  > td {
    position: relative;
    background-color: var(--color-background-selected-dark);
    border-bottom: 0.125rem solid #0000000f;
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    box-shadow: var(--box-shadow);
    width: 80%;

    > div {
      margin-top: 2rem;
    }

    span.symbol {
      color: #b02ace;
    }

    h4 {
      margin: 2.5rem 1rem 1rem;
      font-size: 1.3em;
      font-weight: normal;
      text-align: center;
    }

    .times {
    }
  }

  ${(props): string | false =>
    props.responsive &&
    `
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: #000000b5;
      z-index: 99;

      > td {
        border-radius: var(--border-radius);
      }
  `}
`
const CardDrawerCloser = styled.a`
  position: absolute;
  display: inline-block;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0 0.5em 0 0;
  font-size: 2em;
  text-decoration: none;
`

interface CardDrawerProps {
  children: React.ReactNode
  closeDrawer: () => void
  responsive: boolean
}

export const CardDrawer = React.forwardRef<HTMLTableRowElement, CardDrawerProps>(function ReffedCardDrawer(
  { children, closeDrawer, responsive },
  ref,
) {
  return (
    <CardRowDrawer ref={ref} responsive={responsive}>
      <td>
        <CardDrawerCloser onClick={closeDrawer}>&times;</CardDrawerCloser>
        {children}
      </td>
    </CardRowDrawer>
  )
})

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
  
  > thead {
    position: sticky;
    top: 0;
    background: #EDF2F7;
    z-index: 5;
    font-size: 1.1rem;
    color: #2F3E4E;
    letter-spacing: 0;
    font-weight: var(--font-weight-medium);
  }

  > thead, tbody {
    > tr:not(${CardRowDrawer}) {
      position: relative;
      display: grid;
      grid-template-columns: ${({ $columns }): string => $columns || `repeat(auto-fit, minmax(3rem, 1fr))`};
      // grid-template-rows
      ${({ $rows }): string => ($rows ? `grid-template-rows: ${$rows};` : '')}
      // grid-gap
      ${({ $gap }): string => ($gap ? `grid-gap: ${$gap};` : '')}
      align-items: ${({ $align = 'center' }): string => $align};
      justify-content: ${({ $justify = 'center' }): string => $justify};
      border-bottom: .1rem solid rgba(159,180,201,0.50);
      border-radius: 0;

      // How much separation between ROWS
      margin: ${({ $rowSeparation = '1rem' }): string => `${$rowSeparation} 0`};
      text-align: center;
      transition: all 0.2s ease-in-out;
      z-index: 1;
      
      &.highlight {
        background-color: var(--color-background-highlighted);
        border-bottom-color: #fbdf8f;
      }

      &.selected {
        background-color: var(--color-button-disabled);
        color: #fff;
      }

      // Separation between CELLS
      > th,
      > td {
        margin: ${({ $cellSeparation = '0 .5rem' }): string => $cellSeparation};
        overflow: hidden;
      }
      > th.checked {
        margin: 0;
      }
    }
    
    > tr > td[data-label="Price"] {
      text-align: left;
      // margin: 0 auto 0 0;
    }
    
    > tr > td[data-label="Expires"] {
      text-align: left;
    }
    
    > tr > td[data-label="Unfilled Amount"] {
      text-align: right;
    }
    
    .status {
      text-align: left;
    }

    > ${CardRowDrawer} {
      > td {
        margin-top: ${({ $rowSeparation = '1rem' }): string => `-${Number($rowSeparation.split('rem')[0]) * 2.2}rem`};
      }
    }
  }
  
  .lowBalance {
    color: #B27800;
    display: block;
    > img {margin: 0 0 0 .25rem;}
  }
  
  // Table Header
  > thead {
    // No styling for table header
    > tr {
      background-color: transparent;
      box-shadow: none;

      > th {
        color: inherit;
        line-height: 1;
        font-size: 1rem;
        text-transform: uppercase;
        overflow-wrap: break-word;
        text-align: left;
        padding: 1.3rem 0;
      }
      
      > th.filled {
        text-align: right;
        // white-space: nowrap;
      }
    }
  }

  // Table Body
  tbody {
    font-size: 1.1rem;
    font-family: var(--font-mono);
    font-weight: var(--font-weight-regular);
    color: #476481;
    letter-spacing: -0.08rem;
    line-height: 1.2;
  }
  
  tbody {
    > tr:not(${CardRowDrawer}) {
      // background-color: ${({ $bgColor = 'var(--color-background-pageWrapper)' }): string => $bgColor};
      // border: 0.125rem solid transparent;
      // box-shadow: var(--box-shadow);

      > td {
        &.cardOpener {
          display: none;
        }
      }

      // Don't highlight on hover selected rows or the drawer
      // &:not(.selected):not(.highlight):not(${CardRowDrawer}):hover {
      //   background: var(--color-background-selected);
      //   border: 0.125rem solid var(--color-border);
      // }
    }
  }

  // Top level custom CSS
  ${({ $webCSS }): string | undefined => $webCSS}

  @media ${MEDIA.tablet} {
    > thead, tbody {
      > tr:not(${CardRowDrawer}) {
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
          > td:not(:last-child) {
            border-bottom: 0.0625rem solid #ffffff40;
          }
        }
      }
    }

    // Top level custom css
    ${({ $responsiveCSS }): string | undefined => $responsiveCSS}
  }
`
