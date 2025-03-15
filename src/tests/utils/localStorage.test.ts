import { localStorageService } from '@/utils/localStorage';
import { Todo } from '@/types/todo';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn();

// Mock addEventListener and removeEventListener
const mockAddEventListener = jest.fn((event, handler) => {
  // Store the handler for testing
  if (event === 'storage' || event === 'todos-updated') {
    mockEventHandlers[event] = handler;
  }
});

const mockRemoveEventListener = jest.fn();

// Store event handlers for testing
const mockEventHandlers: Record<string, (event: Event) => void> = {};

// Setup mocks before tests
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });

  window.dispatchEvent = mockDispatchEvent;
  window.addEventListener = mockAddEventListener;
  window.removeEventListener = mockRemoveEventListener;
});

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  mockLocalStorage.clear();
  Object.keys(mockEventHandlers).forEach(key => {
    delete mockEventHandlers[key];
  });
});

describe('localStorageService', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'Test Todo 1',
      completed: false,
      createdAt: new Date('2025-01-01T12:00:00Z'),
    },
    {
      id: '2',
      text: 'Test Todo 2',
      completed: true,
      createdAt: new Date('2025-01-02T12:00:00Z'),
    },
  ];

  describe('getTodos', () => {
    it('should return an empty array if no todos are stored', () => {
      const todos = localStorageService.getTodos();
      expect(todos).toEqual([]);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('todos');
    });

    it('should return todos from localStorage', () => {
      // When localStorage returns data, the dates are serialized as strings
      const serializedTodos = JSON.stringify(mockTodos);
      mockLocalStorage.getItem.mockReturnValueOnce(serializedTodos);

      const todos = localStorageService.getTodos();

      // The dates will be parsed as strings, so we need to compare with serialized data
      const expectedTodos = JSON.parse(serializedTodos);
      expect(todos).toEqual(expectedTodos);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('todos');
    });

    it('should handle JSON parse errors', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('invalid json');

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const todos = localStorageService.getTodos();

      expect(todos).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('saveTodos', () => {
    it('should save todos to localStorage', () => {
      localStorageService.saveTodos(mockTodos);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('todos', JSON.stringify(mockTodos));
      expect(mockDispatchEvent).toHaveBeenCalled();

      const event = mockDispatchEvent.mock.calls[0][0];
      expect(event.type).toBe('todos-updated');
      expect(event.detail).toEqual(mockTodos);
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      localStorageService.saveTodos(mockTodos);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('clearTodos', () => {
    it('should remove todos from localStorage', () => {
      localStorageService.clearTodos();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(mockDispatchEvent).toHaveBeenCalled();

      const event = mockDispatchEvent.mock.calls[0][0];
      expect(event.type).toBe('todos-updated');
      expect(event.detail).toEqual([]);
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      localStorageService.clearTodos();

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('subscribeToUpdates', () => {
    it('should return an unsubscribe function', () => {
      const callback = jest.fn();
      const unsubscribe = localStorageService.subscribeToUpdates(callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call the callback when storage event occurs', () => {
      const callback = jest.fn();
      localStorageService.subscribeToUpdates(callback);

      // Verify that addEventListener was called
      expect(mockAddEventListener).toHaveBeenCalledWith('storage', expect.any(Function));

      // Get the registered handler and call it directly
      const handler = mockEventHandlers['storage'];
      const serializedTodos = JSON.stringify(mockTodos);
      handler({ key: 'todos', newValue: serializedTodos } as StorageEvent);

      // Verify callback was called with parsed todos
      expect(callback).toHaveBeenCalled();
      const expectedTodos = JSON.parse(serializedTodos);
      expect(callback).toHaveBeenCalledWith(expectedTodos);
    });

    it('should not call the callback for other storage keys', () => {
      const callback = jest.fn();
      localStorageService.subscribeToUpdates(callback);

      // Get the registered handler and call it with a different key
      const handler = mockEventHandlers['storage'];
      handler({ key: 'other-key', newValue: JSON.stringify(mockTodos) } as StorageEvent);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should call the callback when custom event occurs', () => {
      const callback = jest.fn();
      localStorageService.subscribeToUpdates(callback);

      // Verify that addEventListener was called
      expect(mockAddEventListener).toHaveBeenCalledWith('todos-updated', expect.any(Function));

      // Get the registered handler and call it directly
      const handler = mockEventHandlers['todos-updated'];
      handler({ detail: mockTodos } as CustomEvent<typeof mockTodos>);

      expect(callback).toHaveBeenCalledWith(mockTodos);
    });

    it('should remove event listeners when unsubscribe is called', () => {
      const callback = jest.fn();
      const unsubscribe = localStorageService.subscribeToUpdates(callback);

      unsubscribe();

      expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
    });
  });
});

// Mock the storage event
const mockStorageEvent = new Event('storage') as StorageEvent;
Object.defineProperty(mockStorageEvent, 'key', { value: 'todos' });
Object.defineProperty(mockStorageEvent, 'newValue', {
  value: JSON.stringify([{ id: '1', text: 'Test Todo', completed: false }]),
});
