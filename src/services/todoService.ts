import { Todo } from '@/types/todo';
import { localStorageService } from '@/utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

// API endpoints
const API_URL = '/api/todos';

// Check if we're in a static export environment
const isStaticExport = () => {
  // In a static export, we can't use server-side API routes
  // We'll detect this by checking if we're in production and if the window object exists
  return typeof window !== 'undefined' && window.location.hostname.includes('amplifyapp.com');
};

// Error handling helper
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json();
};

// Get all todos
export const getTodos = async (): Promise<Todo[]> => {
  try {
    // For static export, use localStorage
    if (isStaticExport()) {
      return localStorageService.getTodos();
    }

    const response = await fetch(API_URL);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching todos:', error);
    // Fallback to localStorage if API fails
    return localStorageService.getTodos();
  }
};

// Add a new todo
export const addTodo = async (text: string): Promise<Todo> => {
  try {
    // For static export, use localStorage
    if (isStaticExport()) {
      const newTodo: Todo = {
        id: uuidv4(),
        text,
        completed: false,
        createdAt: new Date(),
      };
      const todos = localStorageService.getTodos();
      localStorageService.saveTodos([...todos, newTodo]);
      return newTodo;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

// Update a todo
export const updateTodo = async (id: string, updates: Partial<Todo>): Promise<Todo> => {
  try {
    // For static export, use localStorage
    if (isStaticExport()) {
      const todos = localStorageService.getTodos();
      const todoIndex = todos.findIndex(todo => todo.id === id);

      if (todoIndex === -1) {
        throw new Error('Todo not found');
      }

      const updatedTodo = { ...todos[todoIndex], ...updates };
      todos[todoIndex] = updatedTodo;
      localStorageService.saveTodos(todos);
      return updatedTodo;
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

// Delete a todo
export const deleteTodo = async (id: string): Promise<Todo> => {
  try {
    // For static export, use localStorage
    if (isStaticExport()) {
      const todos = localStorageService.getTodos();
      const todoToDelete = todos.find(todo => todo.id === id);

      if (!todoToDelete) {
        throw new Error('Todo not found');
      }

      localStorageService.saveTodos(todos.filter(todo => todo.id !== id));
      return todoToDelete;
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

// Clear all todos
export const clearAllTodos = async (): Promise<void> => {
  try {
    // For static export, use localStorage
    if (isStaticExport()) {
      localStorageService.clearTodos();
      return;
    }

    const response = await fetch(API_URL, {
      method: 'DELETE',
    });
    await handleResponse(response);
  } catch (error) {
    console.error('Error clearing todos:', error);
    throw error;
  }
};

// Subscribe to todo updates from other tabs
export const subscribeToTodoUpdates = (callback: (todos: Todo[]) => void): (() => void) => {
  return localStorageService.subscribeToUpdates(callback);
};
