import React from 'react'
import styled from 'styled-components'

import { HelpTooltip } from 'components/Tooltip'
import { MEDIA, SLIPPAGE_MAP } from 'const'
import { PriceSlippageState } from 'reducers-actions/priceSlippage'

const Wrapper = styled.div`
  background: var(--color-background-input);
  border-radius: var(--border-radius-top);
  padding: 1rem;
  width: 100%;

  font-size: 1.2rem;

  > div {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: space-evenly;

    margin: 1rem auto 0.2rem;
    width: 100%;

    > button {
      border-radius: 3rem;
    }

    > button,
    > label > input {
      flex: 1;

      background: var(--color-background-pageWrapper);
      color: var(--color-text-primary);
      font-size: inherit;
      font-weight: normal;

      height: 3rem;

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
        color: var(--color-background-pageWrapper);
      }

      &.selected,
      &:hover:not(input):not(.selected),
      &:focus {
        background: var(--color-background-button-hover);
      }

      &.selected {
        background: var(--color-background-CTA);
      }

      transition: background 0.2s ease-in-out;
    }

    > label {
      position: relative;
      flex: 1.6;

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
      <small>Limit additional price slippage</small>{' '}
      <HelpTooltip iconSize="xs" tooltip={'Set additional slippage parameters'} />
      <div>
        {slippagePercentages.map((slippage, index) => (
          <button
            key={index}
            type="button"
            onClick={(): void => setNewSlippage(slippage)}
            className={slippage === priceSlippage ? 'selected' : ''}
          >
            <small>
              {slippage}%{SLIPPAGE_MAP.get(slippage) && ' (suggested)'}
            </small>
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

export default MaximumSlippage
