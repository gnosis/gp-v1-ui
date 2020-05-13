import { MultiTcrConfig } from 'types/config'

export const log = (): void => {
  console.log(CONFIG.logoPath)
  console.log(CONFIG.name)
  console.log(CONFIG.defaultProviderConfig.config)

  const {
    config: { lists },
  } = CONFIG.tcr as MultiTcrConfig

  console.log('list 1', lists[0])
}
