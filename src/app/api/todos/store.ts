import { Todo } from '@/types/todo';
import { v4 as uuidv4 } from 'uuid';
import { localStorageService } from '@/utils/localStorage';

// In-memory store for todos
// Initialize with data from localStorage if in browser environment
const store: {
  todos: Todo[];
} = {
  todos: [],
};

// Initialize the store with data from localStorage
export function initializeStore(): void {
  if (typeof window !== 'undefined') {
    store.todos = localStorageService.getTodos();
  }
}

// Initialize on module load
initializeStore();

/**
 * Get all todos
 */
export function getAllTodos(): Todo[] {
  return store.todos;
}

/**
 * Get a todo by ID
 */
export function getTodoById(id: string): Todo | undefined {
  return store.todos.find(todo => todo.id === id);
}

/**
 * Add a new todo
 */
export function addTodo(text: string): Todo {
  const newTodo: Todo = {
    id: uuidv4(),
    text,
    completed: false,
    createdAt: new Date(),
  };

  store.todos.push(newTodo);
  
  // Persist to localStorage if in browser environment
  if (typeof window !== 'undefined') {
    localStorageService.saveTodos(store.todos);
  }
  
  return newTodo;
}

/**
 * Update a todo
 */
export function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, 'text' | 'completed'>>
): Todo | null {
  const todoIndex = store.todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) return null;

  const updatedTodo = {
    ...store.todos[todoIndex],
    ...updates,
  };

  store.todos[todoIndex] = updatedTodo;
  
  // Persist to localStorage if in browser environment
  if (typeof window !== 'undefined') {
    localStorageService.saveTodos(store.todos);
  }
  
  return updatedTodo;
}

/**
 * Delete a todo
 */
export function deleteTodo(id: string): Todo | null {
  const todoIndex = store.todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) return null;

  const deletedTodo = store.todos[todoIndex];
  store.todos.splice(todoIndex, 1);
  
  // Persist to localStorage if in browser environment
  if (typeof window !== 'undefined') {
    localStorageService.saveTodos(store.todos);
  }
  
  return deletedTodo;
}

/**
 * Clear all todos
 */
export function clearAllTodos(): void {
  store.todos = [];
  
  // Persist to localStorage if in browser environment
  if (typeof window !== 'undefined') {
    localStorageService.clearTodos();
  }
}
