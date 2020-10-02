import { walletApi } from 'api'
import { useEffect, useMemo } from 'react'
import { Command, Network } from 'types'
import useSafeState from './useSafeState'
import { BlockchainUpdatePrompt, WalletInfo } from 'api/wallet/WalletApi'

type PendingStateObject = { pending: true; networkIdOrDefault: number } & Partial<WalletInfo>

const PendingState: PendingStateObject = {
  pending: true,
  isConnected: undefined,
  userAddress: undefined,
  networkId: undefined,
  networkIdOrDefault: Network.Mainnet,
}

const constructPendingState = ({ chainId, account, blockHeader }: BlockchainUpdatePrompt): PendingStateObject => {
  const blockNumber = blockHeader?.number
  const networkId = chainId || PendingState.networkId
  const networkIdOrDefault = chainId || PendingState.networkIdOrDefault
  const userAddress = account || PendingState.userAddress

  return {
    ...PendingState,
    networkId,
    networkIdOrDefault,
    userAddress,
    blockNumber,
  }
}

export const useWalletConnection = ():
  | (WalletInfo & { pending: false; networkIdOrDefault: number })
  | PendingStateObject => {
  const [walletInfo, setWalletInfo] = useSafeState<WalletInfo | null>(null)

  useEffect((): Command => {
    return walletApi.addOnChangeWalletInfo(setWalletInfo)
  }, [setWalletInfo])

  return useMemo(() => {
    return !walletInfo
      ? constructPendingState(walletApi.blockchainState)
      : {
          ...walletInfo,
          networkIdOrDefault: walletInfo.networkId || Network.Mainnet,
          pending: false,
        }
  }, [walletInfo])
}
