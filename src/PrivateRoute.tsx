import React, { useEffect } from 'react'
import { Route, RouteProps, Redirect } from 'react-router-dom'
import useSafeState from 'hooks/useSafeState'

const useIsWalletConnected = (): {
  pending: boolean
  isConnected: boolean
} => {
  const [pending, setPending] = useSafeState(true)
  const [isConnected, setIsConnected] = useSafeState(false)

  useEffect(() => {
    import(
      /* webpackChunkName: "API_chunk"*/
      'api'
    )
      .then(({ walletApi }) => walletApi.isConnected())
      .then(isConnected => {
        setIsConnected(isConnected)
        setPending(false)
      })
      .catch(() => {
        setIsConnected(false)
        setPending(false)
      })
  }, [setIsConnected, setPending])

  return { pending, isConnected }
}

const PrivateRoute: React.FC<RouteProps> = (props: RouteProps) => {
  const { pending, isConnected } = useIsWalletConnected()

  const { component: Component, ...rest } = props

  if (pending) {
    return <Route {...rest} render={(): null => null} />
  }

  return (
    <Route
      {...rest}
      render={(props): React.ReactNode =>
        isConnected && Component ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/connect-wallet',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  )
}

export default PrivateRoute
