import BigNumber from 'bignumber.js'

import { Trade, TradeReversion, EventWithBlockInfo } from 'api/exchange/ExchangeApi'

import { Actions } from 'reducers-actions'

import { logDebug, dateToBatchId, toBN, setStorageItem, flattenMapOfLists } from 'utils'
import { TRADES_LOCAL_STORAGE_KEY } from 'const'

// ******** TYPES/INTERFACES

export type ActionTypes = 'OVERWRITE_TRADES' | 'APPEND_TRADES' | 'UPDATE_BLOCK'

export type TradesState = Record<string, TradesStatePerAccount>
export type SerializableTradesState = Record<string, SerializableTradesStatePerAccount>

interface TradesStatePerAccount {
  trades: Trade[]
  tradeIds: Set<string>
  pendingTrades: Map<string, Trade[]>
  lastCheckedBlock?: number
}

interface SerializableTradesStatePerAccount extends Omit<TradesStatePerAccount, 'tradeIds' | 'pendingTrades'> {
  tradeIds: string[]
  pendingTrades: [string, Trade[]][]
}

interface WithReverts {
  reverts: TradeReversion[]
}

interface WithAccountInfo {
  networkId: number
  userAddress: string
}

// ******** ACTION TYPES

type OverwriteTradesActionType = Actions<
  'OVERWRITE_TRADES',
  Pick<TradesStatePerAccount, 'trades' | 'lastCheckedBlock'> & WithReverts & WithAccountInfo
>
type AppendTradesActionType = Actions<
  'APPEND_TRADES',
  Required<Pick<TradesStatePerAccount, 'trades' | 'lastCheckedBlock'>> & WithReverts & WithAccountInfo
>
type UpdateBlockActionType = Actions<
  'UPDATE_BLOCK',
  Required<Pick<TradesStatePerAccount, 'lastCheckedBlock'>> & WithAccountInfo
>
type ReducerActionType = Actions<ActionTypes, TradesStatePerAccount & WithReverts & WithAccountInfo>

interface Params extends WithAccountInfo {
  trades: Trade[]
  reverts: TradeReversion[]
  lastCheckedBlock?: number
}

// ******** REDUCER FUNCTIONS

export const overwriteTrades = (params: Params): OverwriteTradesActionType => ({
  type: 'OVERWRITE_TRADES',
  payload: params,
})

export const appendTrades = (params: Required<Params>): AppendTradesActionType => ({
  type: 'APPEND_TRADES',
  payload: params,
})

export const updateLastCheckedBlock = (
  params: Required<Pick<Params, 'lastCheckedBlock'>> & WithAccountInfo,
): UpdateBlockActionType => ({
  type: 'UPDATE_BLOCK',
  payload: params,
})

export function buildAccountKey({ networkId, userAddress }: WithAccountInfo): string {
  return networkId + '|' + userAddress
}

function buildTradeRevertKey(batchId: number, orderId: string): string {
  return batchId + '|' + orderId
}

// ******** HELPERS

function groupByRevertKey<T extends EventWithBlockInfo>(
  list: T[],
  initial?: Map<string, T[]>,
  seenTradeIds?: Set<string>,
): { group: Map<string, T[]>; seenIds: Set<string> } {
  const group = initial || new Map<string, T[]>()
  const seenIds = seenTradeIds || new Set<string>()
  const newIds = new Set<string>()

  list.forEach((item) => {
    // Avoid duplicate entries
    if (seenIds.has(item.id) || newIds.has(item.id)) {
      return
    }
    newIds.add(item.id)

    const revertKey = buildTradeRevertKey(item.batchId, item.orderId)

    if (group.has(revertKey)) {
      const tradesList = group.get(revertKey) as T[]

      tradesList.push(item)
    } else {
      group.set(revertKey, [item])
    }
  })

  return { group, seenIds: newIds }
}

function sortByTimeAndPosition(a: EventWithBlockInfo, b: EventWithBlockInfo): number {
  if (a.timestamp < b.timestamp) return -1
  if (a.timestamp > b.timestamp) return 1
  // if timestamps are equal, means both happened on the same block
  // in that case, check the event index
  return a.eventIndex - b.eventIndex
}

function getPendingTrades(tradesByRevertKey: Map<string, Trade[]>): Map<string, Trade[]> {
  // Now that we matched the reverts with trades we currently have, we filter the trades
  // that might have reverts still coming in.

  // To be on the very safe side, let's assume pending anything in the last two batches
  const currentBatchId = dateToBatchId()

  // Filter out trades in that range (curr ... curr -2).
  // The `revertKey` is composed by batchId|orderId, so this regex looks for the batchIds in the keys
  const batchesRegex = new RegExp(`^(${currentBatchId}|${currentBatchId - 1}|${currentBatchId - 2})\\\|`)

  const pending = new Map<string, Trade[]>()

  tradesByRevertKey.forEach((trades, key) => {
    if (batchesRegex.test(key)) {
      pending.set(key, trades)
    }
  })

  return pending
}

function applyRevertsToTrades(
  trades: Trade[],
  reverts: TradeReversion[],
  pendingTrades?: Map<string, Trade[]>,
  seenIds?: Set<string>,
): { trades: Trade[]; pendingTrades: Map<string, Trade[]>; seenIds: Set<string> } {
  // Group trades by revertKey
  const { group: tradesByRevertKey, seenIds: newTradeIds } = groupByRevertKey(trades, pendingTrades, seenIds)
  const { group: revertsByRevertKey } = groupByRevertKey(reverts)

  // Assumptions:
  // 1. There can be more than one trade per batch for a given order (even if there are no reverts)
  //    This case is not likely given our current solvers, but it's not forbidden by the contract
  // 2. There will never be more reverts than trades for a given batch/order pair
  // 3. Every revert matches 1 trade
  // 4. Reverts match Trades by order or appearance (first Revert matches first Trade and so on)

  revertsByRevertKey.forEach((revertsList, revertKey) => {
    const reverts = revertsList.sort(sortByTimeAndPosition)
    const trades = tradesByRevertKey.get(revertKey)?.sort(sortByTimeAndPosition)

    if (trades) {
      let tradesIndex = 0
      let revertsIndex = 0
      // Iterate over both trades and reverts while there are any
      while (tradesIndex < trades.length && revertsIndex < reverts.length) {
        if (!trades[tradesIndex].revertId) {
          // Trade was not reverted. Now it is.
          // Update trade, move both indices forward
          trades[tradesIndex].revertId = reverts[revertsIndex].id
          trades[tradesIndex].revertTimestamp = reverts[revertsIndex].timestamp
          logDebug(
            `[reducers:trade][${revertKey}] Trade ${trades[tradesIndex].id} matched to Revert ${reverts[revertsIndex].id}`,
          )
          tradesIndex++
          revertsIndex++
        } else if (trades[tradesIndex].revertId === reverts[revertsIndex].id) {
          // Trade was already reverted by this Revert
          // Move both indices forward
          logDebug(
            `[reducers:trade][${revertKey}] Trade ${trades[tradesIndex].id} was already matched to Revert ${reverts[revertsIndex].id}`,
          )
          tradesIndex++
          revertsIndex++
        } else {
          // Trade was already reverted, not by this Revert
          // Move on to next Trade, keep same Revert
          tradesIndex++
        }
      }
      // Shouldn't happen, but...
      if (tradesIndex === trades.length && revertsIndex < reverts.length) {
        throw new Error(`There are ${reverts.length - revertsIndex} reverts not matched to trades`)
      }
    }
  })

  // Transform groups into a single list
  const newTrades = flattenMapOfLists(tradesByRevertKey)
    // Remove old trades that were used only to help matching possible reverts to new trades
    .filter((trade) => trade && newTradeIds.has(trade.id))

  // Merge existing and new set of ids
  seenIds?.forEach((id) => id && newTradeIds.add(id))

  return {
    trades: newTrades,
    pendingTrades: getPendingTrades(tradesByRevertKey),
    seenIds: newTradeIds,
  }
}

// ******** INITIAL STATE / LOCAL STORAGE

const INITIAL_TRADES_STATE_SINGLE_ACCOUNT = {
  trades: [],
  pendingTrades: new Map<string, Trade[]>(),
  tradeIds: new Set<string>(),
}

/**
 * Custom json parser for BN and BigNumber values.
 * Since there's no context on what is BN/BigNumber,
 * we have to keep track of keys and parse accordingly
 */
function reviver(key: string, value: unknown): unknown {
  if (value && typeof value === 'string') {
    switch (key) {
      case 'limitPrice':
      case 'fillPrice':
        return new BigNumber(value)
      case 'buyAmount':
      case 'sellAmount':
      case 'orderBuyAmount':
      case 'orderSellAmount':
      case 'remainingAmount':
        return toBN(value)
      default:
        return value
    }
  }
  return value
}

function serialize(state: TradesState): SerializableTradesState {
  const serialized = {}

  Object.keys(state).forEach((accountKey) => {
    serialized[accountKey] = { ...state[accountKey], tradeIds: [], pendingTrades: [] }
    state[accountKey].tradeIds?.forEach((id) => serialized[accountKey].tradeIds.push(id))
    state[accountKey].pendingTrades?.forEach((value, key) => serialized[accountKey].pendingTrades.push([key, value]))
  })

  return serialized
}

function deserialize(state: SerializableTradesState): TradesState {
  const parsedState = {}

  Object.keys(state).forEach((accountKey) => {
    parsedState[accountKey] = {
      ...state[accountKey],
      tradeIds: new Set<string>(),
      pendingTrades: new Map<string, Trade[]>(),
    }
    state[accountKey].tradeIds?.forEach((id) => parsedState[accountKey].tradeIds.add(id))
    state[accountKey].pendingTrades?.forEach((tuple) => parsedState[accountKey].pendingTrades.set(...tuple))
  })

  return parsedState
}

function loadInitialState(): TradesState {
  let state = {}

  const localStorageOrders = localStorage.getItem(TRADES_LOCAL_STORAGE_KEY)

  if (localStorageOrders) {
    try {
      state = deserialize(JSON.parse(localStorageOrders, reviver))
    } catch (e) {
      logDebug(`[reducer:trades] Failed to load localStorage`, e.msg)
    }
  }

  return state
}

export const initialState = loadInitialState()

// ******** REDUCER

export const reducer = (state: TradesState, action: ReducerActionType): TradesState => {
  switch (action.type) {
    case 'APPEND_TRADES': {
      const { trades: newTrades, reverts, lastCheckedBlock, networkId, userAddress } = action.payload

      const accountKey = buildAccountKey({ networkId, userAddress })

      const { trades: currTrades, pendingTrades: currPendingTrades, tradeIds } =
        state[accountKey] || INITIAL_TRADES_STATE_SINGLE_ACCOUNT

      const { trades, pendingTrades, seenIds } = applyRevertsToTrades(newTrades, reverts, currPendingTrades, tradeIds)

      return {
        ...state,
        [accountKey]: { trades: currTrades.concat(trades), lastCheckedBlock, pendingTrades, tradeIds: seenIds },
      }
    }
    case 'OVERWRITE_TRADES': {
      const { trades: newTrades, reverts, lastCheckedBlock, networkId, userAddress } = action.payload

      const accountKey = buildAccountKey({ networkId, userAddress })
      const tradeIds = new Set<string>()

      const { trades, pendingTrades, seenIds } = applyRevertsToTrades(newTrades, reverts, undefined, tradeIds)

      return { ...state, [accountKey]: { trades, lastCheckedBlock, pendingTrades, tradeIds: seenIds } }
    }
    case 'UPDATE_BLOCK': {
      const { networkId, lastCheckedBlock } = action.payload

      return { ...state, [networkId]: { ...state[networkId], lastCheckedBlock } }
    }
    default: {
      return state
    }
  }
}

// ******** SIDE EFFECT

export async function sideEffect(state: TradesState, action: ReducerActionType): Promise<void> {
  switch (action.type) {
    case 'APPEND_TRADES':
    case 'OVERWRITE_TRADES':
    case 'UPDATE_BLOCK':
      setStorageItem(TRADES_LOCAL_STORAGE_KEY, serialize(state))
  }
}
