import styled from 'styled-components'

export const TokenSelectorWrapper = styled.div`
  /* display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  grid-gap: 1rem;
  justify-self: center;
  width: 80%; */
  width: 50%;
  width: calc(50% - 1.5rem);
  padding: 0 0 5rem 0;
  box-sizing: border-box;
  height: 34rem;
  overflow-y: auto;
  border: 0.1rem solid #dfe6ef;
  border-radius: 0.6rem;
  margin: 0 0 4rem auto;
  background: #ffffff;
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
  justify-content: flex-start;
  background: ${({ $selected }): string => `${$selected ? 'rgba(33,141,255,0.10);' : '#ffffff;'}`};
  cursor: pointer;
  min-height: 5.6rem;
  font-weight: var(--font-weight-normal);
  font-size: 1.4rem;
  color: #2F3E4E;
  letter-spacing: 0;
  line-height: 1;
  border-bottom: .2rem solid white;
  /* background: var(--color-background-pageWrapper); */
  /* box-shadow: ${({ $selected }): string => ($selected ? '0 0 0 0.175rem green' : 'var(--box-shadow)')}; */
  /* border: ${({ $selected }): string =>
    `0.05rem solid ${$selected ? 'transparent' : 'var(--color-background-selected-dark)'}`}; */
  /* border-radius: var(--border-radius); */

  &:hover {
    /* background: var(--color-background); */
    background: rgba(33,141,255,0.10);
  }

  > img {
    height: auto;
    width: 3.6rem;
    height: 3.6rem;
    object-fit: contain;
    margin: 0 1rem 0 1.6rem;
  }

  > ${CheckboxWrapper} {
    margin: auto 1.6rem;;
    opacity: ${({ $selected }): string => ($selected ? '1' : '0')};
    transition: inherit;
    height: 100%;
    display: flex;
    align-items: center;
  }

  transition: all 0.2s ease-in-out;
`
