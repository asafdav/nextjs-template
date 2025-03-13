import * as todoService from '@/services/todoService';
import { Todo } from '@/types/todo';

// Mock the fetch function
global.fetch = jest.fn();

describe('Todo Service', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test Todo',
    completed: false,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodos', () => {
    it('should fetch todos from the API', async () => {
      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce([mockTodo]),
      });

      const todos = await todoService.getTodos();

      expect(global.fetch).toHaveBeenCalledWith('/api/todos');
      expect(todos).toEqual([mockTodo]);
    });

    it('should handle API errors', async () => {
      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({ error: 'Server error' }),
      });

      await expect(todoService.getTodos()).rejects.toThrow('Server error');
    });
  });

  describe('addTodo', () => {
    it('should add a todo via the API', async () => {
      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTodo),
      });

      const todo = await todoService.addTodo('Test Todo');

      expect(global.fetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'Test Todo' }),
      });
      expect(todo).toEqual(mockTodo);
    });
  });

  describe('updateTodo', () => {
    it('should update a todo via the API', async () => {
      const updatedTodo = { ...mockTodo, completed: true };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(updatedTodo),
      });

      const todo = await todoService.updateTodo('1', { completed: true });

      expect(global.fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
      });
      expect(todo).toEqual(updatedTodo);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo via the API', async () => {
      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTodo),
      });

      const todo = await todoService.deleteTodo('1');

      expect(global.fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'DELETE',
      });
      expect(todo).toEqual(mockTodo);
    });
  });
});
