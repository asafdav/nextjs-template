import * as storeModule from '@/app/api/todos/store';
import { Todo } from '@/types/todo';

// Mock the store module
jest.mock('@/app/api/todos/store', () => ({
  getAllTodos: jest.fn(),
  getTodoById: jest.fn(),
  addTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  clearAllTodos: jest.fn(),
}));

describe('Todo Store Module', () => {
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

  const mockTodo = mockTodos[0];
  const updatedTodo = { ...mockTodo, text: 'Updated Todo', completed: true };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock store functions
    (storeModule.getAllTodos as jest.Mock).mockReturnValue(mockTodos);
    (storeModule.getTodoById as jest.Mock).mockImplementation(id => {
      return id === '1' ? mockTodo : undefined;
    });
    (storeModule.addTodo as jest.Mock).mockReturnValue(mockTodo);
    (storeModule.updateTodo as jest.Mock).mockImplementation(id => {
      return id === '1' ? updatedTodo : null;
    });
    (storeModule.deleteTodo as jest.Mock).mockImplementation(id => {
      return id === '1' ? mockTodo : null;
    });
  });

  describe('getAllTodos', () => {
    it('should return all todos', () => {
      // Act
      const result = storeModule.getAllTodos();

      // Assert
      expect(storeModule.getAllTodos).toHaveBeenCalled();
      expect(result).toEqual(mockTodos);
    });
  });

  describe('getTodoById', () => {
    it('should return a todo by id if it exists', () => {
      // Act
      const result = storeModule.getTodoById('1');

      // Assert
      expect(storeModule.getTodoById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTodo);
    });

    it('should return undefined if todo does not exist', () => {
      // Act
      const result = storeModule.getTodoById('999');

      // Assert
      expect(storeModule.getTodoById).toHaveBeenCalledWith('999');
      expect(result).toBeUndefined();
    });
  });

  describe('addTodo', () => {
    it('should add a new todo', () => {
      // Act
      const result = storeModule.addTodo('New Todo');

      // Assert
      expect(storeModule.addTodo).toHaveBeenCalledWith('New Todo');
      expect(result).toEqual(mockTodo);
    });
  });

  describe('updateTodo', () => {
    it('should update a todo if it exists', () => {
      // Act
      const result = storeModule.updateTodo('1', {
        text: 'Updated Todo',
        completed: true,
      });

      // Assert
      expect(storeModule.updateTodo).toHaveBeenCalledWith('1', {
        text: 'Updated Todo',
        completed: true,
      });
      expect(result).toEqual(updatedTodo);
    });

    it('should return null if todo does not exist', () => {
      // Act
      const result = storeModule.updateTodo('999', {
        text: 'Updated Todo',
        completed: true,
      });

      // Assert
      expect(storeModule.updateTodo).toHaveBeenCalledWith('999', {
        text: 'Updated Todo',
        completed: true,
      });
      expect(result).toBeNull();
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo if it exists', () => {
      // Act
      const result = storeModule.deleteTodo('1');

      // Assert
      expect(storeModule.deleteTodo).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTodo);
    });

    it('should return null if todo does not exist', () => {
      // Act
      const result = storeModule.deleteTodo('999');

      // Assert
      expect(storeModule.deleteTodo).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });

  describe('clearAllTodos', () => {
    it('should clear all todos', () => {
      // Act
      storeModule.clearAllTodos();

      // Assert
      expect(storeModule.clearAllTodos).toHaveBeenCalled();
    });
  });
});
