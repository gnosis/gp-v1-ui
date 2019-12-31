import React, { Suspense } from 'react'
import { withRouter, RouteComponentProps } from 'react-router'

import { walletApi } from 'api'

import { setupAutoconnect } from 'utils'
import UserWallet from './WalletComponent'
import { UserWalletWrapper } from './UserWallet.styled'

const LazyUserWallet = React.lazy(async () => {
  await setupAutoconnect(walletApi)

  return { default: UserWallet }
})

const SuspendedWallet: React.FC<RouteComponentProps> = props => (
  <Suspense fallback={<UserWalletWrapper $walletOpen={false} style={{ visibility: 'hidden' }} />}>
    <LazyUserWallet {...props} />
  </Suspense>
)

export default withRouter(SuspendedWallet)
