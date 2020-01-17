import styled from 'styled-components'

const PageWrapper = styled.div<{ $bgColor?: string; $boxShadow?: string; $width?: string }>`
  background-color: ${({ $bgColor = 'var(--color-background-pageWrapper)' }): string => $bgColor};
  border-radius: var(--border-radius);
  box-shadow: ${({ $boxShadow = 'var(--box-shadow)' }): string => $boxShadow};

  margin: auto;
  padding: 2rem 10vw 2rem 10vw;
  width: ${({ $width = '95vw' }): string => $width};
  min-height: 25rem;
`

export default PageWrapper
