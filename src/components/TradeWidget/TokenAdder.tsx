import React, { useEffect } from 'react'
import Modal from 'components/common/Modal'

import { useBetterAddTokenModal } from 'hooks/useBetterAddTokenModal'
import { TokenDetails } from 'types'

interface TokensAdderProps {
  tokenAddresses: string[]
  networkId: number
  onTokensAdded: (newTokens: TokenDetails[]) => void
}

const TokensAdder: React.FC<TokensAdderProps> = ({ tokenAddresses, networkId, onTokensAdded }) => {
  const { addTokensToList, modalProps } = useBetterAddTokenModal({ focused: true })

  useEffect(() => {
    if (tokenAddresses.length === 0) return

    addTokensToList({ tokenAddresses, networkId }).then((newTokens) => {
      if (newTokens.length > 0) {
        onTokensAdded(newTokens)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // no deps, so that we only open modal once on mount

  return tokenAddresses.length > 0 ? <Modal.Modal {...modalProps} /> : null
}

export default TokensAdder
