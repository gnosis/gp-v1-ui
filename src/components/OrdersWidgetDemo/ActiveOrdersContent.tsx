import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0;
  font-size: var(--font-size-default);
  background: var(--color-primary);

  > table {
    margin: 0;
    height: calc(100% - 8.8rem);
    padding: 0;
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
      border-left: 2px solid var(--color-long);
    }

    &.short {
      color: var(--color-short);
      border-left: 2px solid var(--color-short);
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
    height: auto;
    display: flex;
    align-items: center;
  }

  > table > thead > tr {
    color: var(--color-text-secondary2);
    display: grid;
    width: calc(100% - 0.6rem);
  }

  > table > thead > tr > th {
    /* border: 1px solid grey; */
    font-weight: var(--font-weight-normal);
    &:not(:first-of-type) {
      text-align: right;
    }
    /* &:last-of-type {
      margin-right: 0.7rem;
    } */
  }

  > table > tbody {
    grid-area: body-scrollable;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    box-sizing: border-box;
    padding: 0;
  }

  > table > tbody > tr {
    display: grid;
    width: 100%;
    transition: background 0.1s ease-in-out;
    border-bottom: 0.1rem solid var(--color-border);
    &:hover {
      background: var(--color-text-hover);
      > td {
        color: var(--color-text-primary);
      }
    }

    &:last-of-type {
      margin: 0 0 5rem;
    }
  }

  > table > thead > tr > th,
  > table > tbody > tr > td {
    height: 3rem;
    /* border: 1px solid grey; */
    display: flex;
    align-items: center;
    justify-content: flex-end;
    /* padding: 1rem 0; */

    &:first-of-type {
      padding-left: 1rem;
      justify-content: flex-start;
    }
  }

  > table > thead > tr,
  > table > tbody > tr {
    grid-template-columns: 5rem minmax(14rem, 1fr) repeat(5, 1fr) 7rem;
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
            <th>Amount WETH</th>
            <th>Filled WETH</th>
            <th>Epxires</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(30).keys()].map((i) => (
            <tr key={i}>
              <td className={i % 2 === 1 ? 'long' : 'short'}>{i % 2 === 1 ? 'Buy' : 'Sell'}</td>
              <td>01-10-2020 17:45:{i}2</td>
              <td>WETH/USDT</td>
              <td>370.96</td>
              <td>
                {i}.0{i}
              </td>
              <td>{i}</td>
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
