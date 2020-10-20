import React from 'react'
import ReactDOM from 'react-dom'
import { ToastId } from 'react-toastify'
import { toast } from 'toastify'

import { useWalletConnection } from 'hooks/useWalletConnection'
import useSafeState from 'hooks/useSafeState'

import { Network } from 'types'

const availableNetworks = CONFIG.exchangeContractConfig.config.map(({ networkId }) => networkId)

const NetworkErrorMessage: React.FC = () => (
  <div>
    <div>Please switch to a supported network!</div>
    <strong>{`${availableNetworks.map(
      (id, idx, arr) => (idx === arr.length - 1 ? ' or ' : ' ') + Network[id],
    )}`}</strong>
    <br />
    <br />
    <div>
      Click{' '}
      <a href="https://github.com/gnosis/dex-react/wiki#-compatible-networks" target="_blank" rel="noreferrer">
        here
      </a>{' '}
      for more information
    </div>
  </div>
)

function runCheckOnValidNetworks(networkId?: number): boolean {
  if (!networkId) return true

  return availableNetworks.includes(networkId)
}

const useNetworkCheck = (): void => {
  const [currentNetworkId, setCurrentNetworkId] = useSafeState<Network | undefined>(undefined)
  const [currentNetworkErrorId, setCurrentNetworkErrorId] = useSafeState<ToastId | undefined>(undefined)

  const { networkId } = useWalletConnection()

  const isValidOrNonNetwork = React.useMemo(() => runCheckOnValidNetworks(networkId), [networkId])

  // User switched network, dismiss current error
  React.useEffect(() => {
    const isNewNetworkError = !isValidOrNonNetwork && currentNetworkId !== networkId

    async function dealWithNewNetworkError(): Promise<void> {
      if (isValidOrNonNetwork) {
        if (currentNetworkErrorId) {
          await toast.dismiss(currentNetworkErrorId)
          setCurrentNetworkErrorId(undefined)
        }
      }

      // Connected to a network but not one of the accepted ones
      else if (isNewNetworkError) {
        currentNetworkErrorId && (await toast.dismiss(currentNetworkErrorId))
        const toastID = await toast.error(<NetworkErrorMessage />, {
          autoClose: false,
        })

        ReactDOM.unstable_batchedUpdates(() => {
          setCurrentNetworkId(networkId)
          setCurrentNetworkErrorId(toastID)
        })
      }
    }

    dealWithNewNetworkError()
  }, [
    currentNetworkErrorId,
    currentNetworkId,
    isValidOrNonNetwork,
    networkId,
    setCurrentNetworkErrorId,
    setCurrentNetworkId,
  ])
}

export default useNetworkCheck
