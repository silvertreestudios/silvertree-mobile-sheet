/**
 * In-memory mock for @react-native-async-storage/async-storage.
 * Used automatically by Jest when the module is required in tests.
 */

const store: Record<string, string> = {};

const AsyncStorage = {
  getItem: jest.fn(async (key: string): Promise<string | null> => store[key] ?? null),
  setItem: jest.fn(async (key: string, value: string): Promise<void> => {
    store[key] = value;
  }),
  removeItem: jest.fn(async (key: string): Promise<void> => {
    delete store[key];
  }),
  clear: jest.fn(async (): Promise<void> => {
    Object.keys(store).forEach((k) => delete store[k]);
  }),
  getAllKeys: jest.fn(async (): Promise<string[]> => Object.keys(store)),
  multiGet: jest.fn(async (keys: string[]): Promise<[string, string | null][]> =>
    keys.map((k) => [k, store[k] ?? null])
  ),
  multiSet: jest.fn(async (pairs: [string, string][]): Promise<void> => {
    pairs.forEach(([k, v]) => {
      store[k] = v;
    });
  }),
  multiRemove: jest.fn(async (keys: string[]): Promise<void> => {
    keys.forEach((k) => delete store[k]);
  }),
};

export default AsyncStorage;
