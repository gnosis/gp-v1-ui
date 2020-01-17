import styled from 'styled-components'

export const TokenSelectorWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  grid-gap: 1rem;

  justify-self: center;
  width: 80%;
`

export const CheckboxWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  color: green;
  font-weight: bolder;
  font-size: 1.3rem;
`

export const TokenBox = styled.div<{ $selected: boolean }>`
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;

  background: var(--color-background-pageWrapper);
  box-shadow: ${({ $selected }): string => ($selected ? '0 0 0 0.175rem green' : 'var(--box-shadow)')};
  border: ${({ $selected }): string =>
    `0.05rem solid ${$selected ? 'transparent' : 'var(--color-background-selected-dark)'}`};
  border-radius: var(--border-radius);
  cursor: pointer;
  min-height: 6rem;

  &:hover {
    background: var(--color-background);
  }

  > * {
    margin: 0 0.5rem;
  }

  > img {
    height: auto;
    width: 2.3rem;
  }

  > ${CheckboxWrapper} {
    margin: 0.2rem 0.4rem;
    opacity: ${({ $selected }): string => ($selected ? '1' : '0')};
    transition: inherit;
  }

  transition: all 0.2s ease-in;
`
