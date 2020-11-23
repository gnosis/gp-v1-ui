import React, { useState, useMemo } from 'react'
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

  > div {
    list-style: none;
    display: flex;
    flex-flow: row nowrap;
    padding: 0;
    justify-content: space-between;
    width: 100%;
  }
`

const Tabs: React.FC<Props> = ({ tabItems }) => {
  const [activeTab, setActiveTab] = useState(0)
  const { content } = useMemo((): TabItemType => tabItems[activeTab], [activeTab, tabItems])

  return (
    <Wrapper>
      <div role="tablist">
        {tabItems.map(({ title, activeColor }, index) => (
          <TabItem
            key={index}
            title={title}
            onTabClick={(): void => setActiveTab(index)}
            activeColor={activeTab === index && activeColor}
          />
        ))}
      </div>

      {content && <TabContent content={content} />}
    </Wrapper>
  )
}

export default Tabs
