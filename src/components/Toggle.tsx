import React from 'react'
import styled from 'styled-components'

interface ToggleSize {
  width: string
  height: string
}

type ToggleProps = React.InputHTMLAttributes<HTMLInputElement> & Partial<ToggleSize>

// get rid of width, height
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ToggleBase: React.FC<ToggleProps> = ({ className, width, height, ...props }) => {
  return (
    <label className={className}>
      <input type="checkbox" {...props} hidden />
      <span />
    </label>
  )
}

const defaultSize: ToggleSize = { width: '2.8em', height: '1em' }

// don't pass on theme object, it'll get spread over input anyway
const ToggleStyled = styled(ToggleBase).attrs(props => ({ ...defaultSize, ...props, theme: undefined }))<ToggleSize>`
  --span-width: ${(props): string => props.width};
  --span-height: ${(props): string => props.height};
  /* easier to set vars once, than copy the whole func into each calc() */
  padding: 1em;
  cursor: pointer;

  span {
    background-color: #e0e6ee;
    width: var(--span-width);
    height: var(--span-height);
    display: flex;
    align-items: center;
    border-radius: 0.45em;
    transition: background-color 0.3s;
  }

  span::after {
    --check-size: calc(var(--span-height) * 1.3);
    content: '';
    border: 1px solid #cbcbcb;
    width: var(--check-size);
    height: var(--check-size);
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 1px 1px 3px 1px grey;
    transform: translateX(-50%);
    transition: transform 0.3s;
  }

  input:focus + span {
    outline: 1px dotted gray;
  }

  input:checked + span {
    background-color: #428ef7;
    &::after {
      transform: translateX(calc(var(--span-width) - 50%));
    }
  }
`

export { ToggleStyled as Toggle }
