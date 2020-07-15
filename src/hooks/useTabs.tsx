import React, { useCallback } from 'react'
import styled from 'styled-components'

import { MEDIA } from 'const'
import useSafeState from 'hooks/useSafeState'

const TabsWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  flex-flow: row nowrap;
  height: 6.4rem;
  width: 100%;
  justify-content: center;
  border-bottom: 0.1rem solid var(--color-text-secondary);
  align-items: center;

  @media ${MEDIA.mobile} {
    margin: 0 auto;
  }

  .countContainer {
    display: flex;
    flex-flow: row nowrap;
    height 100%;
    width: 100%;
    margin: 0 0 -0.1rem;
    align-items: center;

    > button {
      font-weight: var(--font-weight-bold);
      font-size: 1.5rem;
      color: var(--color-text-secondary);
      letter-spacing: 0;
      text-align: center;
      background: transparent;
      flex: 1;
      height: 100%;
      outline: 0;
      text-transform: uppercase;
      display: flex;
      flex: 1 1 25%;
      width: 100%;
      justify-content: center;
      transition: border 0.2s ease-in-out;
      align-items: center;
      border-bottom: 0.3rem solid transparent;

      > i {
        height: 1.8rem;
        font-weight: inherit;
        font-size: 1.1rem;
        color: var(--color-background-pageWrapper);
        letter-spacing: -0.046rem;
        text-align: center;
        background: var(--color-text-secondary);
        border-radius: 6rem;
        padding: 0 0.75rem;
        box-sizing: border-box;
        line-height: 1.8rem;
        font-style: normal;
        display: inline-block;
        height: 1.8rem;
        margin: 0 0 0 0.5rem;
      }

      @media ${MEDIA.mobile} {
        flex: 1;
        font-size: 1.2rem;
        min-height: 5.4rem;

        > i {
          font-size: 0.9rem;
          height: 1.3rem;
          line-height: 1.36rem;
        }
      }

      @media ${MEDIA.xSmallDown} {
        flex-flow: column nowrap;

        > i {
          margin: 0.3rem auto;
        }
      }
    }

    > button.selected {
      border-bottom: 0.3rem solid var(--color-text-active);
      color: var(--color-text-active);
    }

    > button.selected > i {
      background: var(--color-text-active);
    }
  }
`

interface TabData<T> {
  type: T
  count?: string | number
}

interface TabsProps<T> {
  className?: string
  tabsList?: TabData<T>[]
}

interface UseTabsReturn<T> {
  selectedTab: T
  setSelectedTabFactory: (type: T) => (event: React.SyntheticEvent<HTMLButtonElement | HTMLFormElement>) => void
  Tabs: React.FC<TabsProps<T>>
}

function useTabs<T>(defaultTab: T): UseTabsReturn<T> {
  const [selectedTab, setSelectedTab] = useSafeState<T>(defaultTab)
  const setSelectedTabFactory = useCallback(
    (type: T): ((event: React.SyntheticEvent<HTMLButtonElement | HTMLFormElement>) => void) => (
      event: React.SyntheticEvent<HTMLButtonElement | HTMLFormElement>,
    ): void => {
      // form is being submitted when clicking on tab buttons, thus preventing default
      event.preventDefault()

      setSelectedTab(type)
    },
    [setSelectedTab],
  )

  const Tabs: React.FC<TabsProps<T>> = ({ children, className, tabsList = [] }) => {
    return (
      <TabsWrapper className={className}>
        <div className="countContainer">
          {children ||
            tabsList.map((tab, index) => (
              <button
                key={index}
                type="button"
                className={tab.type === selectedTab ? 'selected' : ''}
                onClick={setSelectedTabFactory(tab.type)}
              >
                {tab.type} {tab.count && <i>{tab.count}</i>}
              </button>
            ))}
        </div>
      </TabsWrapper>
    )
  }

  return {
    Tabs,
    selectedTab,
    setSelectedTabFactory,
  }
}

export default useTabs
