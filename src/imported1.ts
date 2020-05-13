import { MultiTcrConfig } from 'types/config'

export const log = (): void => {
  const { config } = CONFIG.defaultProviderConfig
  console.log('ID:', config)

  console.log('lists', (CONFIG.tcr as MultiTcrConfig).config.lists[0])
}
