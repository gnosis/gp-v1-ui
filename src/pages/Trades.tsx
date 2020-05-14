import React from 'react'
import { ContentPage } from 'components/Layout/PageWrapper'
import { CardTable } from 'components/Layout/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faClock } from '@fortawesome/free-solid-svg-icons'

const Trades: React.FC = () => {
  return (
    <ContentPage>
      <CardTable $columns="10rem 10rem 1fr 1fr .9fr" $rowSeparation="0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Price</th>
            <th>Sold</th>
            <th>Bought</th>
            <th>Settled</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              2020/05/02 <br /> 17:23:22 UTC
            </td>
            <td>0.99 USDC/DAI</td>
            <td>99 USDC</td>
            <td>100 DAI</td>
            <td>
              <FontAwesomeIcon icon={faClock} />
            </td>
          </tr>
          <tr>
            <td>
              2020/05/02 <br /> 17:21:22 UTC
            </td>
            <td>1.01 DAI/USDC</td>
            <td>100 DAI</td>
            <td>101 USDC</td>
            <td>
              <FontAwesomeIcon icon={faCheck} />
            </td>
          </tr>
          <tr>
            <td>
              2020/05/02 <br /> 17:21:20 UTC
            </td>
            <td>1.1 DAI/USDC</td>
            <td>10 DAI</td>
            <td>11 USDC</td>
            <td>
              <FontAwesomeIcon icon={faCheck} />
            </td>
          </tr>
        </tbody>
      </CardTable>
    </ContentPage>
  )
}

export default Trades
