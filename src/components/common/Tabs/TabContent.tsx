import React from 'react'
import { TabItemType } from 'components/OrderBuySell'

type Props = {
  tabItems: TabItemType[]
  activeTab: number
}

const TabContent: React.FC<Props> = ({ tabItems, activeTab }) => (
  <div>
    {tabItems.map((tab) => {
      return tab.id === activeTab ? tab.content : null
    })}
  </div>
)

export default TabContent
