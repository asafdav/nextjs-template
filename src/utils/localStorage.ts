import { Todo } from '@/types/todo';

const STORAGE_KEY = 'todos';

/**
 * Utility service for interacting with localStorage
 */
export const localStorageService = {
  /**
   * Get all todos from localStorage
   */
  getTodos: (): Todo[] => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const storedTodos = localStorage.getItem(STORAGE_KEY);
      return storedTodos ? JSON.parse(storedTodos) : [];
    } catch (error) {
      console.error('Error getting todos from localStorage:', error);
      return [];
    }
  },

  /**
   * Save todos to localStorage
   */
  saveTodos: (todos: Todo[]): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      // Dispatch a custom event to notify other tabs
      window.dispatchEvent(new CustomEvent('todos-updated', { detail: todos }));
    } catch (error) {
      console.error('Error saving todos to localStorage:', error);
    }
  },

  /**
   * Clear all todos from localStorage
   */
  clearTodos: (): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      // Dispatch a custom event to notify other tabs
      window.dispatchEvent(new CustomEvent('todos-updated', { detail: [] }));
    } catch (error) {
      console.error('Error clearing todos from localStorage:', error);
    }
  },

  /**
   * Subscribe to todos updates from other tabs
   */
  subscribeToUpdates: (callback: (todos: Todo[]) => void): () => void => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const todos = event.newValue ? JSON.parse(event.newValue) : [];
        callback(todos);
      }
    };

    const handleCustomEvent = (event: CustomEvent<Todo[]>) => {
      callback(event.detail);
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (from this tab)
    window.addEventListener('todos-updated', handleCustomEvent as EventListener);

    // Return unsubscribe function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('todos-updated', handleCustomEvent as EventListener);
    };
  }
}; 