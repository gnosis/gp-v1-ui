import * as React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  min-height: 40vh;
  width: 600px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: var(--color-widget-bg);
`

interface WidgetProps {
  children: React.ReactNode
}

const Widget: React.FC<WidgetProps> = ({ children }: WidgetProps) => <Wrapper>{children}</Wrapper>

export default Widget
