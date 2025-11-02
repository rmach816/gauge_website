import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

/**
 * Network and connectivity utilities
 */
export const NetworkService = {
  /**
   * Check current network status
   */
  async getNetworkState(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? null,
      type: state.type,
    };
  },

  /**
   * Subscribe to network state changes
   */
  subscribe(callback: (state: NetworkState) => void) {
    return NetInfo.addEventListener((state) => {
      callback({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type,
      });
    });
  },

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    const state = await this.getNetworkState();
    return state.isConnected === true && state.isInternetReachable === true;
  },
};

