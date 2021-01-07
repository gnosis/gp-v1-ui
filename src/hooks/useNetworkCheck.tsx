import React from 'react'
import { toast } from 'toastify'

import { useWalletConnection } from 'hooks/useWalletConnection'

import { Network } from 'types'

const { config: networkIdList } = CONFIG.exchangeContractConfig
const availableNetworks = new Set(networkIdList.map(({ networkId }) => networkId))
const availableNetworksName = networkIdList
  .map(({ networkId: id }, idx, arr) => (idx === arr.length - 1 ? 'or ' : '') + Network[id])
  .join(', ')

const NetworkErrorMessage: React.FC = () => (
  <div>
    <div>Please switch to a supported network!</div>
    <strong>{availableNetworksName}</strong>
    <br />
    <br />
    <div>
      Click{' '}
      <a href="https://github.com/gnosis/gp-v1-ui/wiki#-compatible-networks" target="_blank" rel="noopener noreferrer">
        here
      </a>{' '}
      for more information
    </div>
  </div>
)

function runCheckOnValidNetworks(networkId?: number): boolean {
  if (!networkId) return true

  return availableNetworks.has(networkId)
}

const useNetworkCheck = (): void => {
  const { networkId } = useWalletConnection()

  React.useEffect(() => {
    const isValidOrNonNetwork = runCheckOnValidNetworks(networkId)

    if (isValidOrNonNetwork) return

    const promisedToastID = toast.error(<NetworkErrorMessage />, {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
    })

    return (): void => {
      promisedToastID.then((toastID) => toast.dismiss(toastID))
    }
  }, [networkId])
}

export default useNetworkCheck
