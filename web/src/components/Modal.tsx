import styled from 'styled-components'

export const DEFAULT_MODAL_OPTIONS = {
  centered: true,
  animated: true,
  closeButton: true,
}

export const ModalBodyWrapper = styled.div`
  padding: 0.5rem 1.5rem;

  div > p {
    font-size: inherit;
    color: inherit;
    padding: 0;
  }
`
