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
  z-index: 9999;
  width: 50rem;
  height: 42rem;
  border-radius: 0.6rem;
  background: #ffffff;

  @media ${MEDIA.mobile} {
    width: 100%;
    bottom: 0;
    top: initial;
    height: 80vh;
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
      color: #2f3e4e;
      margin: 0;
      display: flex;
      align-items: center;
      font-family: var(--font-default);
      font-weight: var(--font-weight-regular);
      border-bottom: 0.1rem solid #dfe6ef;
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
  // grid-gap: ${({ $headerGap = '0.3rem' }): string => $headerGap};
  width: 100%;

  .checked {
    margin: 0;
    outline: 0;
  }


  &.balancesOverview {
    width: auto;
    padding: 0 0 2.4rem;
    min-width: 85rem;
    max-width: 140rem;
    background: #ffffff;
    box-shadow: 0 -1rem 4rem 0 rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02) 0 0.276726rem 0.221381rem 0,
      rgba(0, 0, 0, 0.027) 0 0.666501rem 0.532008rem 0, rgba(0, 0, 0, 0.035) 0 1.25216rem 1.0172rem 0,
      rgba(0, 0, 0, 0.043) 0 2.23363rem 1.7869rem 0, rgba(0, 0, 0, 0.05) 0 4.17776rem 3.34221rem 0,
      rgba(0, 0, 0, 0.07) 0 10rem 8rem 0;
    border-radius: 0.6rem;
    margin: 0 auto;
    min-height: 54rem;
    font-size: 1.6rem;
    line-height: 1;

    @media ${MEDIA.tablet} {
      min-width: 100vw;
      min-width: calc(100vw - 4.8rem);
      width: 100%;
      max-width: 100%;
    }
    
    @media ${MEDIA.mobile} {
      max-width: 100%;
      min-width: initial;
      width: 100%;
      
      > div {
        flex-flow: row wrap;
      }
    }
  }

  &.balancesOverview > tbody {
    font-size: 1.3rem;
    line-height: 1;
    
      @media ${MEDIA.mobile} {
        display: flex;
        flex-flow: column wrap;
        width: 100%;
      }
  }

  &.balancesOverview > thead {
    background: #FFFFFF;
    border-radius: .6rem;
    
      @media ${MEDIA.mobile} {
        display: none;
      }
  }

  &.balancesOverview > thead > tr:not(${CardRowDrawer}),
  &.balancesOverview > tbody > tr:not(${CardRowDrawer}) {
    grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr) );
    text-align: right;
    padding: .8rem;
    margin: 0;
    justify-content: flex-start;
    
      @media ${MEDIA.mobile} {
        padding: 1.6rem .8rem;
        display: table;
        flex-flow: column wrap;
        width: 100%;
        border-bottom: .2rem solid rgba(159,180,201,0.50);
      }
  }

  &.balancesOverview > thead > tr:not(${CardRowDrawer}) >  th {
    font-size: 1.1rem;
    color: #2F3E4E;
    letter-spacing: 0;
    text-align: right;
    padding: .8rem;
    text-transform: uppercase;

      &:first-of-type {
        text-align: left;
      }
  }

  &.balancesOverview > tbody > tr:not(${CardRowDrawer}) > td {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 0 .5rem;
    text-align: right;
    justify-content: flex-end;
    word-break: break-all;
    white-space: normal;
    
    @media ${MEDIA.mobile} {
      width: 100%;
      border-bottom: 0.1rem solid rgba(0, 0, 0, 0.14);
      padding: 1rem .5rem;
      flex-flow: row nowrap;
      
        &:last-of-type {
          border: 0;
        }
    }

    &:first-of-type {
      text-align: left;
      justify-content: flex-start;
    }
    
    &[data-label=Token] {
      font-family: var(--font-default);
      letter-spacing: 0;
      line-height: 1.2;
      flex-flow: row nowrap;
    }
    
    &[data-label=Token] > div > b {
      display: block;
      color: #2F3E4E;
    }
    
    &::before {
      @media ${MEDIA.mobile} {
        content: attr(data-label);
        margin-right: auto;
        font-weight: var(--font-weight-medium);
        text-transform: uppercase;
        font-size: 1rem;
        font-family: var(--font-default);
        letter-spacing: -.03rem;
        white-space: nowrap;
        padding: 0 .5rem 0 0;
        color: #2F3E4E;
      }
    }
    
    > div {
      @media ${MEDIA.mobile} {
        text-align: right;
      }
    }
  }
  
  > thead {
    position: sticky;
    background: #ecf2f7;
    top: 0;
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
      z-index: 1;

      &:hover {
        background: #deeeff;
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
    font-size: 1.1rem;
    font-family: var(--font-mono);
    font-weight: var(--font-weight-regular);
    color: #476481;
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
