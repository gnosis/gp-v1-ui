import styled from 'styled-components'

export const InputBox = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0;
  width: 100%;
  height: 5.6rem;
  position: relative;

  input {
    margin: 0;
    width: 100%;
    background: var(--color-background-input);
    border-radius: 0.6rem 0.6rem 0 0;
    border: 0;
    font-size: 1.6rem;
    line-height: 1;
    box-sizing: border-box;
    border-bottom: 0.2rem solid transparent;
    font-weight: var(--font-weight-normal);
    padding: 0 15rem 0 1rem;
    outline: 0;

    &:focus {
      border-bottom: 0.2rem solid var(--color-text-active);
      border-color: var(--color-text-active);
      color: var(--color-text-active);
    }

    &.error {
      border-color: var(--color-error);
    }

    &.warning {
      color: #ff5722;
    }

    &:disabled {
      box-shadow: none;
    }

    &[readonly] {
      background-color: var(--color-background-pageWrapper);
      border: 1px solid var(--color-background-input);
    }
  }
`

export default InputBox
