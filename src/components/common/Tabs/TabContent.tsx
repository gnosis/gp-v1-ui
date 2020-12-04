import React from 'react'
import { TabItemType } from 'components/common/Tabs/Tabs'

type Props = {
  tabItems: TabItemType[]
  activeTab: number
}

const TabContent: React.FC<Props> = (props) => {
  const { tabItems, activeTab } = props
  return (
    <div>
      {tabItems.map((tab) => {
        return tab.id === activeTab ? tab.content : null
      })}
    </div>
  )
}

export default TabContent
