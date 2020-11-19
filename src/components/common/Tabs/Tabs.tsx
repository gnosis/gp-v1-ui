import React, { useState } from 'react'
import styled from 'styled-components'

// Components
import { TabItemType } from 'components/OrderBuySell'
import TabItem from 'components/common/Tabs/TabItem'
import TabContent from 'components/common/Tabs/TabContent'

interface Props {
  tabItems: TabItemType[]
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;

  > ul {
    list-style: none;
    display: flex;
    flex-flow: row nowrap;
    padding: 0;
    justify-content: space-between;
    width: 100%;
  }
`

const Tabs: React.FC<Props> = ({ tabItems }) => {
  const [activeTab, setActiveTab] = useState(1)

  return (
    <Wrapper>
      <ul>
        {tabItems.map(({ id, title, activeColor }) => (
          <TabItem
            key={id}
            title={title}
            onTabClick={(): void => setActiveTab(id)}
            activeColor={activeTab === id && activeColor}
          />
        ))}
      </ul>
      <TabContent content={tabItems.find((tab) => tab.id === activeTab)?.content} />
    </Wrapper>
  )
}

export default Tabs
