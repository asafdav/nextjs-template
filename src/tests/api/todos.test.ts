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

// Mock the NextResponse.json function
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
}));

// Import the API routes after mocking
import { GET, POST, DELETE as DELETEAll } from '@/app/api/todos/route';
import { GET as GETById, PUT, DELETE as DELETEById } from '@/app/api/todos/[id]/route';

describe('Todo API Routes', () => {
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

  // Create a simple mock request
  const createMockRequest = (body?: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body || {}),
    } as unknown as Request;
  };

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

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(storeModule.getAllTodos).toHaveBeenCalled();
      expect(data).toEqual(mockTodos);
    });
  });

  describe('POST /api/todos', () => {
    it('should add a new todo', async () => {
      // Arrange
      const request = createMockRequest({ text: 'New Todo' });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(storeModule.addTodo).toHaveBeenCalledWith('New Todo');
      expect(data).toEqual(mockTodo);
    });

    it('should return 400 if text is missing', async () => {
      // Arrange
      const request = createMockRequest({});

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(storeModule.addTodo).not.toHaveBeenCalled();
      expect(data).toEqual({ error: 'Text is required and must be a string' });
    });

    it('should return 400 if request body is invalid', async () => {
      // Arrange
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Request;

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(storeModule.addTodo).not.toHaveBeenCalled();
      expect(data).toEqual({ error: 'Invalid request body' });
    });
  });

  describe('DELETE /api/todos', () => {
    it('should clear all todos', async () => {
      // Act
      const response = await DELETEAll();
      const data = await response.json();

      // Assert
      expect(storeModule.clearAllTodos).toHaveBeenCalled();
      expect(data).toEqual({ message: 'All todos cleared successfully' });
    });
  });

  describe('GET /api/todos/[id]', () => {
    it('should return a todo by id if it exists', async () => {
      // Act
      const response = await GETById(undefined, { params: { id: '1' } });

      // Assert
      expect(storeModule.getTodoById).toHaveBeenCalledWith('1');
      expect(await response.json()).toEqual(mockTodo);
    });

    it('should return 404 if todo does not exist', async () => {
      // Act
      const response = await GETById(undefined, { params: { id: '999' } });
      const data = await response.json();

      // Assert
      expect(storeModule.getTodoById).toHaveBeenCalledWith('999');
      expect(data).toEqual({ error: 'Todo not found' });
    });
  });

  describe('PUT /api/todos/[id]', () => {
    it('should update a todo if it exists', async () => {
      // Arrange
      const request = createMockRequest({ text: 'Updated Todo', completed: true });

      // Act
      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      // Assert
      expect(storeModule.updateTodo).toHaveBeenCalledWith('1', {
        text: 'Updated Todo',
        completed: true,
      });
      expect(data).toEqual(updatedTodo);
    });

    it('should return 404 if todo does not exist', async () => {
      // Arrange
      const request = createMockRequest({ text: 'Updated Todo', completed: true });

      // Act
      const response = await PUT(request, { params: { id: '999' } });
      const data = await response.json();

      // Assert
      expect(storeModule.updateTodo).toHaveBeenCalledWith('999', {
        text: 'Updated Todo',
        completed: true,
      });
      expect(data).toEqual({ error: 'Todo not found' });
    });

    it('should return 400 if request body is invalid', async () => {
      // Arrange
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Request;

      // Act
      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      // Assert
      expect(storeModule.updateTodo).not.toHaveBeenCalled();
      expect(data).toEqual({ error: 'Invalid request body' });
    });
  });

  describe('DELETE /api/todos/[id]', () => {
    it('should delete a todo if it exists', async () => {
      // Act
      const response = await DELETEById(undefined, { params: { id: '1' } });
      const data = await response.json();

      // Assert
      expect(storeModule.deleteTodo).toHaveBeenCalledWith('1');
      expect(data).toEqual(mockTodo);
    });

    it('should return 404 if todo does not exist', async () => {
      // Act
      const response = await DELETEById(undefined, { params: { id: '999' } });
      const data = await response.json();

      // Assert
      expect(storeModule.deleteTodo).toHaveBeenCalledWith('999');
      expect(data).toEqual({ error: 'Todo not found' });
    });
  });
});
