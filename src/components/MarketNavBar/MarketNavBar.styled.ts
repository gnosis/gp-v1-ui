import styled from 'styled-components'
// import ArrowWhite from 'assets/img/arrow-white.svg'

export const MarketNavBarStyled = styled.div`
  display: flex;
  width: 100%;
  height: var(--height-bar-default);
  background: var(--color-primary);
  border-bottom: 0.1rem solid var(--color-border);
  grid-area: marketnavbar;
  align-self: flex-start;
  justify-content: space-between;
  align-items: center;
  /* padding: var(--padding-container-default); */
  padding: 0 1.6rem;
  font-size: var(--font-size-large);
`
