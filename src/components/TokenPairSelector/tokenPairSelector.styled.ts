import styled from 'styled-components'
import ArrowWhite from 'assets/img/arrow-white.svg'

export const TokenPairSelectorStyled = styled.div`
  display: flex;
  width: 100%;

  > button {
    width: 100%;
    height: var(--height-bar-default);
    background: var(--color-primary);
    color: var(--color-text-secondary1);
    appearance: none;
    border: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.6rem;
    box-sizing: border-box;
    border-bottom: 0.1rem solid var(--color-border);
    outline: 0;
    transition: color 0.3s ease-in-out;
    cursor: pointer;

    &:hover {
      color: var(--color-text-primary);
    }
  }

  > button > b {
    font-size: 1.5rem;
    letter-spacing: 0.03rem;
  }

  > button > i {
    font-size: 1.2rem;
    font-style: normal;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    font-weight: var(--font-weight-medium);

    &::after {
      display: block;
      height: 1.2rem;
      width: 1.2rem;
      content: '';
      background: url(${ArrowWhite}) no-repeat center/contain;
      transform: rotate(90deg);
      margin: 0 0 0 0.7rem;
    }
  }
`
