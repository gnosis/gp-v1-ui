export interface TcrApi {
  getTokens(networkId: number): Promise<string[]>
}
