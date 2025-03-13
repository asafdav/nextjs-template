import { 
  getAllTodos, 
  getTodoById, 
  addTodo, 
  updateTodo, 
  deleteTodo,
  clearAllTodos,
  initializeStore
} from '@/app/api/todos/store';
import { localStorageService } from '@/utils/localStorage';
import { Todo } from '@/types/todo';

// Mock the localStorage service
jest.mock('@/utils/localStorage', () => ({
  localStorageService: {
    getTodos: jest.fn(),
    saveTodos: jest.fn(),
    clearTodos: jest.fn(),
  },
}));

describe('Todo Store', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the store's internal state
    clearAllTodos();
    
    // Mock localStorage to return empty array by default
    (localStorageService.getTodos as jest.Mock).mockReturnValue([]);
  });

  describe('getAllTodos', () => {
    it('should return all todos from the store', () => {
      // Arrange: Add todos to the store
      mockTodos.forEach(todo => addTodo(todo.text));
      
      // Act
      const todos = getAllTodos();
      
      // Assert
      expect(todos.length).toBe(2);
      expect(todos[0].text).toBe('Test Todo 1');
      expect(todos[1].text).toBe('Test Todo 2');
    });
    
    it('should initialize with todos from localStorage if available', () => {
      // Arrange: Mock localStorage to return todos
      (localStorageService.getTodos as jest.Mock).mockReturnValue(mockTodos);
      
      // Act: Force re-initialization
      initializeStore();
      const todos = getAllTodos();
      
      // Assert
      expect(todos).toEqual(mockTodos);
      expect(localStorageService.getTodos).toHaveBeenCalled();
    });
  });

  describe('getTodoById', () => {
    it('should return a todo by id if it exists', () => {
      // Arrange: Add todos to the store
      const addedTodos = mockTodos.map(todo => addTodo(todo.text));
      const todoId = addedTodos[0].id;
      
      // Act
      const todo = getTodoById(todoId);
      
      // Assert
      expect(todo).toBeDefined();
      expect(todo?.id).toBe(todoId);
      expect(todo?.text).toBe('Test Todo 1');
    });

    it('should return undefined if todo does not exist', () => {
      // Act
      const todo = getTodoById('non-existent-id');
      
      // Assert
      expect(todo).toBeUndefined();
    });
  });

  describe('addTodo', () => {
    it('should add a todo to the store', () => {
      // Act
      const todo = addTodo('New Todo');
      
      // Assert
      expect(todo).toBeDefined();
      expect(todo.text).toBe('New Todo');
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeDefined();
      expect(todo.createdAt).toBeDefined();
      
      // Verify localStorage was updated
      expect(localStorageService.saveTodos).toHaveBeenCalled();
      expect(localStorageService.saveTodos).toHaveBeenCalledWith([todo]);
    });
  });

  describe('updateTodo', () => {
    it('should update a todo if it exists', () => {
      // Arrange: Add a todo to the store
      const todo = addTodo('Original Todo');
      
      // Act
      const updatedTodo = updateTodo(todo.id, {
        text: 'Updated Todo',
        completed: true,
      });
      
      // Assert
      expect(updatedTodo).toBeDefined();
      expect(updatedTodo?.text).toBe('Updated Todo');
      expect(updatedTodo?.completed).toBe(true);
      expect(updatedTodo?.id).toBe(todo.id);
      
      // Verify localStorage was updated
      expect(localStorageService.saveTodos).toHaveBeenCalledTimes(2); // Once for add, once for update
    });

    it('should return null if todo does not exist', () => {
      // Act
      const updatedTodo = updateTodo('non-existent-id', {
        text: 'Updated Todo',
        completed: true,
      });
      
      // Assert
      expect(updatedTodo).toBeNull();
      
      // Verify localStorage was not updated
      expect(localStorageService.saveTodos).not.toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo if it exists', () => {
      // Arrange: Add a todo to the store
      const todo = addTodo('Todo to delete');
      
      // Act
      const deletedTodo = deleteTodo(todo.id);
      
      // Assert
      expect(deletedTodo).toBeDefined();
      expect(deletedTodo?.id).toBe(todo.id);
      expect(getAllTodos().length).toBe(0);
      
      // Verify localStorage was updated
      expect(localStorageService.saveTodos).toHaveBeenCalledTimes(2); // Once for add, once for delete
    });

    it('should return null if todo does not exist', () => {
      // Act
      const deletedTodo = deleteTodo('non-existent-id');
      
      // Assert
      expect(deletedTodo).toBeNull();
      
      // Verify localStorage was not updated
      expect(localStorageService.saveTodos).not.toHaveBeenCalledTimes(2);
    });
  });

  describe('clearAllTodos', () => {
    it('should remove all todos from the store', () => {
      // Arrange: Add todos to the store
      addTodo('Todo 1');
      addTodo('Todo 2');
      
      // Act
      clearAllTodos();
      
      // Assert
      expect(getAllTodos().length).toBe(0);
      
      // Verify localStorage was cleared
      expect(localStorageService.clearTodos).toHaveBeenCalled();
    });
  });
}); 