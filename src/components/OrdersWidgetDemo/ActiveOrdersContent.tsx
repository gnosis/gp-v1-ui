import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0;
  font-size: var(--font-size-default);

  > table {
    margin: 0;
    height: 100%;
    padding: 0.5rem 0 1rem;
    box-sizing: border-box;
    width: 100%;
    border-spacing: 0;
    display: inline-grid;
    grid-template-areas:
      'head-fixed'
      'body-scrollable';
  }

  > table tr {
    text-align: left;
    padding: 0;
  }

  > table tr > td {
    padding: 0;
    color: var(--color-text-secondary2);
    border-bottom: 0.1rem solid var(--color-border);
    transition: color 0.1s ease-in-out;
    box-sizing: border-box;

    /* &:first-of-type,
    &:last-of-type {
      padding: 0 0 0 1rem;
    } */

    &:not(:first-of-type) {
      text-align: right;
    }

    &.long {
      color: var(--color-long);
    }

    &.short {
      color: var(--color-short);
    }

    &.action {
      /* justify-content: space-between;
      align-items: center; */
    }
  }

  > table > thead {
    grid-area: head-fixed;
    position: sticky;
    top: 0;
    height: 2.4rem;
    display: flex;
    align-items: center;
  }

  > table > thead > tr {
    color: var(--color-text-secondary2);
    display: grid;
    width: 100%;
  }

  > table > thead > tr > th {
    font-weight: var(--font-weight-normal);
    &:not(:first-of-type) {
      text-align: right;
    }
  }

  > table > tbody {
    grid-area: body-scrollable;
    overflow-y: auto;
    overflow-x: hidden;
    height: auto;
    box-sizing: border-box;
    padding: 0;
  }

  > table > tbody > tr {
    display: grid;
    width: 100%;
    transition: background 0.1s ease-in-out;
    &:hover {
      background: var(--color-text-hover);
      > td {
        color: var(--color-text-primary);
      }
    }
  }

  /* > table > tbody > tr > td {
  } */

  > table > thead > tr,
  > table > tbody > tr {
    grid-template-columns: 3.6rem repeat(6, 1fr) 7rem;
    white-space: nowrap;
    align-items: center;
  }
`

const CancelledOrderButton = styled.button`
  appearance: none;
  background: none;
  border: 0;
  color: var(--color-text-primary);
  cursor: pointer;
`

export const ActiveOrdersContent: React.FC = () => {
  return (
    <Wrapper>
      <table>
        <thead>
          <tr>
            <th>Side</th>
            <th>Date</th>
            <th>Pair</th>
            <th>Limit price</th>
            <th>Amount</th>
            <th>Filled</th>
            <th>Epxires</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(30).keys()].map((i) => (
            <tr key={i}>
              <td className={i % 2 === 1 ? 'long' : 'short'}>{i % 2 === 1 ? 'Buy' : 'Sell'}</td>
              <td>01-10-2020 17:45:{i}2</td>
              <td>WETH USDT</td>
              <td>370.96 USDT</td>
              <td>
                {i}.0{i} WETH
              </td>
              <td>{i} WETH</td>
              <td>Never</td>
              <td className="action">
                Active <CancelledOrderButton>✕</CancelledOrderButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Wrapper>
  )
}
