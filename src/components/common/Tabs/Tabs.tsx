import React, { useState } from 'react'
import styled from 'styled-components'

// Components
import { TabItemType } from 'components/OrderBuySell'
import TabItem from 'components/common/Tabs/TabItem'
import TabContent from 'components/common/Tabs/TabContent'

interface Props {
  tabItems: TabItemType[]
}

const Tabs: React.FC<Props> = (props) => {
  const [activeTab, setActiveTab] = useState<number>(1)

  const onTabClick = (id: number): void => {
    return setActiveTab(id)
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

  return (
    <Wrapper>
      <ul>
        {props.tabItems.map(({ id, title, activeColor }) => (
          <TabItem
            key={id}
            id={id}
            title={title}
            onTabClick={(): void => onTabClick(id)}
            isActive={activeTab === id}
            activeColor={activeColor}
          />
        ))}
      </ul>
      <TabContent tabItems={props.tabItems} activeTab={activeTab} />
    </Wrapper>
  )
}

export default Tabs
