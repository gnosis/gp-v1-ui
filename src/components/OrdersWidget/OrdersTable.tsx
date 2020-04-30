import React from 'react'
import { AuctionElement, PendingTxObj } from 'api/exchange/ExchangeApi'
import { CardTable } from 'components/Layout/Card'
import OrderRow from './OrderRow'
import { OrderTabs } from '.'

interface OrdersTableProps {
  displayedOrders: AuctionElement[]
  displayedPendingOrders: AuctionElement[]
  networkId: number
  deleting: boolean
  selectedTab: OrderTabs
  markedForDeletion: Set<string>
  overBalanceOrders: Set<string>
  toggleSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void
  toggleMarkForDeletionFactory: (orderId: string, selectedTab: OrderTabs) => () => void
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  displayedPendingOrders,
  displayedOrders,
  toggleSelectAll,
  markedForDeletion,
  deleting,
  networkId,
  selectedTab,
  overBalanceOrders,
  toggleMarkForDeletionFactory,
}) => {
  return (
    <div className="ordersContainer">
      <CardTable
        $columns="minmax(2rem,.4fr)  minmax(11rem,1fr)  minmax(11rem,1.3fr)  minmax(5rem,.9fr)  minmax(auto,1.4fr)"
        $rowSeparation="0"
      >
        <thead>
          <tr>
            <th className="checked">
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={markedForDeletion.size === displayedOrders.length}
                disabled={deleting}
              />
            </th>
            <th>Limit price</th>
            <th className="filled">Filled / Total</th>
            <th>Expires</th>
            <th className="status">Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedPendingOrders.map((order: PendingTxObj) => (
            <OrderRow
              key={order.id}
              order={order}
              networkId={networkId}
              isOverBalance={false}
              pending
              disabled={deleting}
              isPendingOrder
              transactionHash={order.txHash}
            />
          ))}
          {displayedOrders.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              networkId={networkId}
              isOverBalance={overBalanceOrders.has(order.id)}
              isMarkedForDeletion={markedForDeletion.has(order.id)}
              toggleMarkedForDeletion={toggleMarkForDeletionFactory(order.id, selectedTab)}
              pending={deleting && markedForDeletion.has(order.id)}
              disabled={deleting}
            />
          ))}
        </tbody>
      </CardTable>
    </div>
  )
}
