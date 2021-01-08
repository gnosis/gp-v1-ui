import React, { useState } from 'react'
import styled from 'styled-components'

// Components
import TabItem from 'components/common/Tabs/TabItem'
import TabContent from 'components/common/Tabs/TabContent'

export interface TabItemType {
  readonly id: number
  readonly title: string
  readonly content: React.ReactNode
  readonly count?: number
}
export interface TabThemeType {
  readonly activeBg?: string
  readonly activeBgAlt?: string
  readonly inactiveBg?: string
  readonly activeText?: string
  readonly inactiveText?: string
  readonly activeBorder?: string
  readonly inactiveBorder?: string
  readonly letterSpacing?: string
  readonly fontWeight?: string
  readonly fontSize?: string
  readonly borderRadius?: boolean
}
interface Props {
  readonly tabItems: TabItemType[]
  readonly theme?: TabThemeType
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
  height: 100%;
  > div {
    display: flex;
    flex-flow: row nowrap;
    padding: 0;
    justify-content: space-between;
    width: 100%;
  }
`

const Tabs: React.FC<Props> = (props) => {
  const [activeTab, setActiveTab] = useState<number>(1)
  const theme = props.theme ? props.theme : undefined

  return (
    <Wrapper>
      <div role="tablist" className="tablist">
        {props.tabItems.map(({ id, title, count }) => (
          <TabItem
            key={id}
            id={id}
            title={title}
            onTabClick={(): void => setActiveTab(id)}
            isActive={activeTab === id}
            theme={theme}
            count={count}
          />
        ))}
      </div>
      <TabContent tabItems={props.tabItems} activeTab={activeTab} />
    </Wrapper>
  )
}

export default Tabs
