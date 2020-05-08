import React from 'react'
import styled from 'styled-components'

const ToggleBase: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <label className={className}>
      <input type="checkbox" {...props} hidden />
      <span />
    </label>
  )
}

const ToggleStyled = styled(ToggleBase)`
  padding: 1em;
  cursor: pointer;

  span {
    background-color: #e0e6ee;
    width: 2.8em;
    height: 1em;
    display: flex;
    align-items: center;
    border-radius: 0.45em;
    transition: background-color 0.3s;
  }

  span::after {
    content: '';
    border: 1px solid #cbcbcb;
    width: 1.3em;
    height: 1.3em;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 1px 1px 3px 1px grey;
    transform: translateX(calc(-1.3em / 2));
    transition: transform 0.3s;
  }

  input:focus + span {
    outline: 1px dotted gray;
  }

  input:checked + span {
    background-color: #428ef7;
    &::after {
      transform: translateX(calc(100% + 1.3em / 2));
    }
  }
`

export { ToggleStyled as Toggle }
