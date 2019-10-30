import React from 'react'
import styled from 'styled-components'

import { Row } from './Row'
import { useTokenBalances } from 'hooks/useTokenBalances'
import ErrorMsg from 'components/ErrorMsg'
import Widget from 'components/layout/Widget'

const Wrapper = styled.section`
  .gridContainer {
    display: grid;
    width: 100%;
  }

  .headerContainer {
    display: inherit;
    justify-content: center;
    align-items: center;
    grid-template-columns: 1.1fr repeat(4, 1fr);

    > div {
      color: #000000;
      line-height: 1.5;
      font-size: 0.8em;
      text-transform: uppercase;
      overflow-wrap: break-word;
      padding: 0.5em;
      font-weight: 800;
    }

    @media screen and (max-width: 500px) {
      display: none;
    }
  }

  .rowContainer {
    display: inherit;
    grid-template-rows: auto;
  }

  .row {
    text-align: center;
    transition: all 0.5s ease;
  }
`

/* const useResponsive = (): void | number => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  function handleResize(): void | number {
    // check that client can handle this sexiness
    const innerWidth = typeof window !== 'object' ? null : window.innerWidth

    return setWindowWidth(innerWidth)
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)

    return (): void => window.removeEventListener('resize', handleResize)
  }, [])

  return windowWidth
} */

const DepositWidget: React.FC = () => {
  const { balances, error } = useTokenBalances()

  if (balances === undefined) {
    // Loading: Do not show the widget
    return null
  }
  return (
    <Widget>
      <Wrapper>
        {error ? (
          <ErrorMsg title="oops..." message="Something happened while loading the balances" />
        ) : (
          <div className="gridContainer">
            <div className="headerContainer">
              <div className="row">Token</div>
              <div className="row">Exchange wallet</div>
              <div className="row">Pending withdrawals</div>
              <div className="row">Wallet</div>
              <div className="row">Actions</div>
            </div>
            <div className="rowContainer">
              {balances &&
                balances.map(tokenBalances => <Row key={tokenBalances.addressMainnet} tokenBalances={tokenBalances} />)}
            </div>
          </div>
        )}
      </Wrapper>
    </Widget>
  )
}

export default DepositWidget
