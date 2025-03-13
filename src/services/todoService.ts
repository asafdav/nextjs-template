import { Todo } from '@/types/todo';
import { localStorageService } from '@/utils/localStorage';

// API endpoints
const API_URL = '/api/todos';

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
    const response = await fetch(API_URL);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

// Add a new todo
export const addTodo = async (text: string): Promise<Todo> => {
  try {
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
export const subscribeToTodoUpdates = (callback: (todos: Todo[]) => void): () => void => {
  return localStorageService.subscribeToUpdates(callback);
};
