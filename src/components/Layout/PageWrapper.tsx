import styled from 'styled-components'

<<<<<<< HEAD
const PageWrapper = styled.div<{ $bgColor?: string; $boxShadow?: string; $width?: string }>`
  background-color: ${({ $bgColor = 'var(--color-background-pageWrapper)' }): string => $bgColor};
  box-shadow: ${({ $boxShadow = 'var(--box-shadow)' }): string => $boxShadow};

  margin: auto;
  padding: 2rem 10vw 2rem 10vw;
  width: ${({ $width = '95vw' }): string => $width};
=======
const PageWrapper = styled.div`
  background-color: white;
  box-shadow: 1px 1px #e8e8e8;

  margin: auto;
  padding: 2rem 10vw 2rem 10vw;
  width: 95vw;
>>>>>>> .page > PageWrapper
  min-height: 25rem;
`

export default PageWrapper
