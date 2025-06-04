import { isLocalStorageAvailable, getStorageItem, setStorageItem, removeStorageItem } from '../lib/storage'

describe('storage helpers', () => {
  const originalStorage = global.localStorage

  beforeEach(() => {
    const store: Record<string, string> = {}
    const mockStorage = {
      getItem: jest.fn((key: string) => store[key] ?? null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
      }),
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
      get length() { return Object.keys(store).length },
      clear: jest.fn(() => { for (const k in store) delete store[k] })
    }
    Object.defineProperty(global, 'localStorage', { value: mockStorage })
  })

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', { value: originalStorage })
    jest.restoreAllMocks()
  })

  test('set and get item', () => {
    const result = setStorageItem('foo', { a: 1 })
    expect(result).toBe(true)
    const value = getStorageItem('foo', null)
    expect(value).toEqual({ a: 1 })
  })

  test('remove item', () => {
    setStorageItem('bar', 2)
    const removed = removeStorageItem('bar')
    expect(removed).toBe(true)
    const value = getStorageItem('bar', null)
    expect(value).toBeNull()
  })

  test('unavailable storage returns default', () => {
    Object.defineProperty(global, 'localStorage', { value: null })
    const value = getStorageItem('baz', 'def')
    expect(value).toBe('def')
  })
})
