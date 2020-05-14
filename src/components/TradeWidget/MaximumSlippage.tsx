import React from 'react'
import styled from 'styled-components'

import { HelpTooltip } from 'components/Tooltip'
import { MEDIA } from 'const'

const MaximumSlippageWrapper = styled.div`
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

    > button,
    > label > input[type='text'] {
      flex: 1;

      background: var(--color-background-pageWrapper);
      color: var(--color-text-primary);
      font-size: inherit;
      font-weight: normal;

      border-radius: 3rem;
      height: 3rem;

      padding: 0.65rem 1.5rem;
      &:not(:last-child) {
        margin-right: 1rem;
      }

      white-space: nowrap;

      &.selected,
      &:hover:not(input),
      &:focus,
      &:focus ~ small {
        color: var(--color-background-pageWrapper);
      }

      &.selected,
      &:hover:not(input),
      &:focus {
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

      > input[type='text'] {
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

interface SlippageParam {
  value: number
  suggested?: boolean
}

interface MaximumSlippageProps {
  availableSlippage?: SlippageParam[]
}

const DEFAULT_AVAILABLE_SLIPPAGE = [{ value: 0.1 }, { value: 0.5, suggested: true }, { value: 1 }]

const MaximumSlippage: React.FC<MaximumSlippageProps> = ({ availableSlippage = DEFAULT_AVAILABLE_SLIPPAGE }) => {
  return (
    <MaximumSlippageWrapper>
      <small>Limit additional price slippage</small>{' '}
      <HelpTooltip iconSize="xs" tooltip={'Set additional slippage parameters'} />
      <div>
        {availableSlippage.map(({ value, suggested }, index) => (
          <button key={value + index} type="button" onClick={(): void => alert(`Slippage Value:: ${value}`)}>
            <small>
              {value}%{suggested && ' (suggested)'}
            </small>
          </button>
        ))}
        <label>
          <input type="text" placeholder="Custom" />
          <small>%</small>
        </label>
      </div>
    </MaximumSlippageWrapper>
  )
}

export default MaximumSlippage
