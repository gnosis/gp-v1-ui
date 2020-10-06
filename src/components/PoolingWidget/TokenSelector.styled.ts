import styled from 'styled-components'
import { MEDIA } from 'const'

export const TokenSelectorWrapper = styled.div`
  width: 50%;
  width: calc(50% - 1.5rem);
  box-sizing: border-box;
  height: 33.6rem;
  overflow-y: auto;
  border: 0.1rem solid var(--color-background-banner);
  border-radius: 0.6rem;
  margin: 0 0 0 auto;
  background: var(--color-background-pageWrapper);

  @media ${MEDIA.mobile} {
    width: 100%;
    margin: 1.6rem auto 2.4rem;
    height: 28rem;
  }
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
  background: ${({ $selected }): string =>
    `${$selected ? 'rgba(33,141,255,0.10);' : 'var(--color-background-pageWrapper);'}`};
  cursor: pointer;
  min-height: 5.6rem;
  font-weight: var(--font-weight-normal);
  font-size: 1.4rem;
  color: var(--color-text-primary);
  letter-spacing: 0;
  line-height: 1;
  border-bottom: 0.2rem solid var(--color-background-pageWrapper);
  transition: all 0.2s ease-in-out;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(33, 141, 255, 0.1);
  }

  > img {
    width: 3.6rem;
    height: 3.6rem;
    object-fit: contain;
    margin: 0 1rem 0 1.6rem;
  }

  > ${CheckboxWrapper} {
    margin: auto 1.6rem;
    opacity: ${({ $selected }): string => ($selected ? '1' : '0')};
    transition: inherit;
    height: 100%;
    display: flex;
    align-items: center;
  }
`
