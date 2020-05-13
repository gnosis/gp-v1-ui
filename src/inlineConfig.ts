import { MultiTcrConfig } from 'types/config'
import { log as log1 } from './imported1'
import { log as log2 } from './imported2'
const { config } = CONFIG.defaultProviderConfig
console.log('ID:', config)

console.log('list 1', (CONFIG.tcr as MultiTcrConfig).config.lists[0])
log1()
log2()
