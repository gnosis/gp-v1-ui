import React from 'react'
import styled from 'styled-components'

import { MEDIA, SLIPPAGE_MAP } from 'const'
import { PriceSlippageState } from 'reducers-actions/priceSlippage'

const Wrapper = styled.div`
  font-size: 1.6rem;
  width: 100%;

  > strong {
    display: flex;
    align-items: center;
    text-transform: capitalize;
    color: var(--color-text-primary);
    width: 100%;
    margin: 0 0 1rem;
    padding: 0;
    box-sizing: border-box;
    font-size: 1.5rem;

    @media ${MEDIA.mobile} {
      font-size: 1.3rem;
    }
  }

  > div {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: space-evenly;

    margin: 1rem auto 0.2rem;
    height: 4.4rem;
    width: 100%;

    > button {
      border-radius: 3rem;

      > small {
        font-size: x-small;
        margin-left: 0.4rem;
      }
    }

    > button,
    > label > input {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-evenly;

      background: var(--color-background-input);
      color: var(--color-text-primary);
      font-size: inherit;
      font-weight: normal;

      height: 100%;

      padding: 0.65rem 1.5rem;
      &:not(:last-child) {
        margin-right: 1rem;
      }

      white-space: nowrap;

      &.selected,
      &.selected ~ small,
      &:hover:not(input),
      &:focus,
      &:focus ~ small {
        color: var(--color-text-button-hover);
      }

      &:hover:not(input):not(.selected),
      &:focus {
        background-color: var(--color-background-button-hover);
      }

      &.selected {
        background: var(--color-text-active);
      }

      transition: all 0.2s ease-in-out;
    }

    > label {
      position: relative;
      flex: 1.6;
      height: 100%;

      > small {
        position: absolute;
        right: 2rem;
        top: 0;
        bottom: 0;
        margin: auto;

        display: flex;
        align-items: center;

        opacity: 0.75;
        color: var(--color-text-primary);

        letter-spacing: -0.05rem;
        text-align: right;
        font-weight: var(--font-weight-bold);

        @media ${MEDIA.mobile} {
          font-size: 1rem;
          letter-spacing: 0.03rem;
        }
      }

      > input {
        border-radius: var(--border-radius-top);
        margin: 0;
        padding-right: 3.4rem;
        width: 100%;

        &::placeholder {
          opacity: 0.6;
        }
      }
    }
  }
`

interface MaximumSlippageProps {
  priceSlippage: PriceSlippageState
  setNewSlippage: (customSlippage: string | React.ChangeEvent<HTMLInputElement>) => void
}

const slippagePercentages = Array.from(SLIPPAGE_MAP.keys())

const checkCustomPriceSlippage = (slippagePercentage: string): boolean =>
  !!slippagePercentage && !SLIPPAGE_MAP.has(slippagePercentage)

const MaximumSlippage: React.FC<MaximumSlippageProps> = ({ setNewSlippage, priceSlippage }) => {
  return (
    <Wrapper>
      <strong>Limit additional price slippage</strong>
      <div>
        {slippagePercentages.map((slippage, index) => (
          <button
            key={index}
            type="button"
            onClick={(): void => setNewSlippage(slippage)}
            className={slippage === priceSlippage ? 'selected' : ''}
          >
            {slippage}%{SLIPPAGE_MAP.get(slippage) && <small>(suggested)</small>}
          </button>
        ))}
        <label>
          <input
            type="number"
            step="0.1"
            placeholder="Custom"
            value={priceSlippage}
            className={checkCustomPriceSlippage(priceSlippage) ? 'selected' : ''}
            onChange={(e): void => setNewSlippage(e.target.value)}
          />
          <small>%</small>
        </label>
      </div>
    </Wrapper>
  )
}

/*
  // PRICE SLIPPAGE
  const dispatchNewSlippage = (payload: string): void => dispatch(setPriceSlippage(payload))
  // to add in Price component to show current selected slippage
  
  {priceSlippage && (
    <FormMessage className="warning">
      <small>{priceSlippage}% slippage</small>
    </FormMessage>
  )}
*/

export default MaximumSlippage
