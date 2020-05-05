import { AnyAction } from 'combine-reducers'
import { GlobalState } from 'reducers-actions'

/**
 * Middleware
 * next: React.Dispatch<AnyAction> === the NEXT dispatch in the middleware thru-put
 */
export type Middleware = (
  getState: () => GlobalState,
  dispatch: React.Dispatch<AnyAction>,
) => (next: React.Dispatch<AnyAction>) => (action: AnyAction) => void
