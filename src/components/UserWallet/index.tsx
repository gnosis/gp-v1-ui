import React, { Suspense } from 'react'
import { withRouter, RouteComponentProps } from 'react-router'

import { UserWalletWrapper } from './UserWallet.styled'

const LazyUserWallet = React.lazy(async () => {
  const UserWalletProm = import(
    /* webpackChunkName: "WalletComponet_chunk"*/
    './WalletComponent'
  )
  const [{ setupAutoconnect }, { walletApi }] = await Promise.all([
    import(
      /* webpackChunkName: "autoconnect_chunk"*/
      'utils/autoconnect'
    ),
    import(
      /* webpackChunkName: "API_chunk"*/
      'api'
    ),
  ])
  await setupAutoconnect(walletApi)

  return UserWalletProm
})

const SuspendedWallet: React.FC<RouteComponentProps> = props => (
  <Suspense fallback={<UserWalletWrapper style={{ visibility: 'hidden' }} />}>
    <LazyUserWallet {...props} />
  </Suspense>
)

export default withRouter(SuspendedWallet)
