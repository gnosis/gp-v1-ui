import styled from 'styled-components'

export const PageWrapper = styled.div<{ $bgColor?: string; $boxShadow?: string; $width?: string }>`
  /* background-color: ${({ $bgColor = 'var(--color-background-pageWrapper)' }): string => $bgColor}; */
  /* border-radius: var(--border-radius); */
  /* box-shadow: ${({ $boxShadow = 'var(--box-shadow)' }): string => $boxShadow}; */
  /* margin: auto; */
  /* padding: 0; */
  /* width: ${({ $width = '95vw' }): string => $width}; */
  /* width: 100%; */
`

export const ContentPage = styled(PageWrapper)`
  display: flex;
  flex-flow: row wrap;
  padding: 2.4rem 2.4rem 8rem;
  box-sizing: border-box;
  align-items: flex-start;
  align-content: flex-start;
  position: relative;
  max-width: 85rem;
  background: var(--color-background-pageWrapper);
  box-shadow: var(--box-shadow-wrapper);
  border-radius: 0.6rem;
  margin: 0 auto;
  min-height: 54rem;
  font-size: 1.4rem;
  line-height: 1.4;

  h1 {
    margin: 1rem auto 2.4rem;
    width: 100%;
    text-align: left;
    font-weight: var(--font-weight-bold);
    font-size: 2rem;
    color: var(--color-text-primary);
    letter-spacing: 0;
  }
  h2 {
    margin: 1.5rem auto 0.5rem;
    text-align: left;
    width: 100%;
    font-size: 1.8rem;
    letter-spacing: 0;
  }

  ul {
    display: block;
    margin: 0;
    width: 100%;
  }
`
