import styled from 'styled-components'

const PageWrapper = styled.div<{ $bgColor?: string; $width?: string }>`
  background-color: ${({ $bgColor = 'var(--color-background-pageWrapper)' }): string => $bgColor};
  box-shadow: 1px 1px #e8e8e8;

  margin: auto;
  padding: 2rem 10vw 2rem 10vw;
  width: ${({ $width = '95vw' }): string => $width};
  min-height: 25rem;
`

export default PageWrapper
