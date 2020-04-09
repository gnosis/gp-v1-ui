import React from 'react'
import styled from 'styled-components'
import { MEDIA } from 'const'

const CardRowDrawer = styled.tr`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  box-shadow: 0 100vh 0 999vw rgba(47, 62, 78, 0.5);
  z-index: 9998;
  width: 50rem;
  height: 50rem;
  border-radius: 0.6rem;
  background: var(--color-background-pageWrapper);

  @media ${MEDIA.mobile} {
    width: 100%;
    bottom: 0;
    top: initial;
    height: 100vh;
    overflow-y: scroll;
  }

  // Inner td wrapper
  > td {
    position: relative;
    background: transparent;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.14);
    border-radius: 6px;
    margin: 0;
    width: 100%;
    height: 100%;
    border: 0;

    @media ${MEDIA.mobile} {
      box-shadow: none;
    }

    > div {
      margin: 0;
    }

    span.symbol {
      color: #b02ace;
    }

    > div > h4 {
      height: 5.6rem;
      padding: 0 1.6rem;
      box-sizing: border-box;
      letter-spacing: 0;
      font-size: 1.6rem;
      text-align: left;
      color: var(--color-text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      font-family: var(--font-default);
      font-weight: var(--font-weight-regular);
      border-bottom: 0.1rem solid var(--color-background-banner);

      @media ${MEDIA.mobile} {
        padding: 0 5rem 0 1.6rem;
      }
    }

    .times {
    }
  }
`
const CardDrawerCloser = styled.a`
  position: absolute;
  right: 1.6rem;
  top: 0.8rem;
  text-decoration: none;
  font-size: 4rem;
  line-height: 1;
  color: #526877;
  opacity: 0.5;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

interface CardDrawerProps {
  children: React.ReactNode
  closeDrawer: () => void
}

export const CardDrawer = React.forwardRef<HTMLTableRowElement, CardDrawerProps>(function ReffedCardDrawer(
  { children, closeDrawer },
  ref,
) {
  return (
    <CardRowDrawer ref={ref}>
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

  $webCSS?: string
}>`
  display: grid;
  flex: 1;
  // grid-gap: ${({ $headerGap = '0.3rem' }): string => $headerGap};
  width: 100%;

  .checked {
    margin: 0;
    outline: 0;
  }
  
  > thead {
    position: sticky;
    z-index: 2;
    background: var(--color-background-row-hover);
    top: 0;
    font-size: 1.1rem;
    color: var(--color-text-primary);
    letter-spacing: 0;
    font-weight: var(--font-weight-bold);
  }

  > thead, tbody {
    > tr:not(${CardRowDrawer}) {
      position: relative;
      display: grid;
      // grid-template-columns: ${({ $columns }): string => $columns || `repeat(auto-fit, minmax(3rem, 1fr))`};
      // grid-template-columns: minmax(2rem,.4fr) minmax(7rem,16rem) minmax(4rem,11rem) minmax(5rem, 7.5rem) minmax(3rem,9rem);
      grid-template-columns: 3.2rem 1fr 1fr minmax(3rem,8rem) minmax(5rem,9rem);
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

      &:hover {
        background: var(--color-background-row-hover);
      }
      
      &.highlight {
        background-color: var(--color-background-highlighted);
        border-bottom-color: #fbdf8f;
      }

      &.selected {
        background-color: rgba(159,180,201,0.50);
      }

      // Separation between CELLS
      > th,
      > td {
        // margin: ${({ $cellSeparation = '0 .5rem' }): string => $cellSeparation};
        text-overflow: ellipsis;
        overflow: hidden;
        text-align: left;
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
        font-size: 1.1rem;
        padding: 1.3rem 0;
      }
      
      > th.filled {
      }
    }
  }

  // Table Body
  tbody {
    flex: 1;
    display: flex;
    flex-flow: nowrap column;
    font-size: 1.1rem;
    font-family: var(--font-mono);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-primary);
    letter-spacing: -0.085rem;
    line-height: 1.2;
  }
  
  tbody {
    > tr:not(${CardRowDrawer}) {

      > td {
        &.cardOpener {
          display: none;
        }
      }

    }
  }

  // Top level custom CSS
  ${({ $webCSS }): string | undefined => $webCSS}
`
