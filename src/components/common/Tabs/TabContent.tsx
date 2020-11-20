import React from 'react'

type Props = {
  content?: string | React.ReactNode
}

const TabContent: React.FC<Props> = ({ content }) => <div>{content}</div>

export default TabContent
