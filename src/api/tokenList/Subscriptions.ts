import { Command } from 'types'

export type SubscriptionCallback<T> = (newState: T) => void

export interface SubscriptionsInterface<State> {
  subscribe(callback: SubscriptionCallback<State>): Command
  unsubscribe(callback: SubscriptionCallback<State>): void
  unsubscribeAll(): void
}

export default class GenericSubscriptions<State> implements SubscriptionsInterface<State> {
  private _subscriptions: SubscriptionCallback<State>[] = []

  public subscribe(callback: SubscriptionCallback<State>): Command {
    this._subscriptions.push(callback)

    return (): void => this.unsubscribe(callback)
  }

  public unsubscribe(callback: SubscriptionCallback<State>): void {
    this._subscriptions = this._subscriptions.filter(sub => sub !== callback)
  }

  protected triggerSubscriptions(newState: State): void {
    this._subscriptions.forEach(sub => sub(newState))
  }

  public unsubscribeAll(): void {
    this._subscriptions = []
  }
}
