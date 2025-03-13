import { store } from '@/app/api/todos/store';
import * as storeModule from '@/app/api/todos/store';

// Mock the store module functions
jest.mock('@/app/api/todos/store', () => {
  const originalModule = jest.requireActual('@/app/api/todos/store');
  return {
    ...originalModule,
    getAllTodos: jest.fn(),
    getTodoById: jest.fn(),
    addTodo: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
    store: {
      todos: []
    }
  };
});

// Import the API routes after mocking
import { GET, POST } from '@/app/api/todos/route';
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/todos/[id]/route';

// Mock NextResponse.json
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => {
      return { data, status: options?.status || 200 };
    })
  }
}));

// Import NextResponse after mocking
import { NextResponse } from 'next/server';

describe('Todo API Routes', () => {
  const mockTodo = {
    id: '1',
    text: 'Test Todo',
    completed: false,
    createdAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      // Setup
      const mockTodos = [mockTodo];
      (storeModule.getAllTodos as jest.Mock).mockReturnValue(mockTodos);

      // Execute
      await GET();

      // Assert
      expect(storeModule.getAllTodos).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(mockTodos);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      // Setup
      (storeModule.addTodo as jest.Mock).mockReturnValue(mockTodo);
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ text: 'Test Todo' })
      };

      // Execute
      await POST(mockRequest as any);

      // Assert
      expect(storeModule.addTodo).toHaveBeenCalledWith('Test Todo');
      expect(NextResponse.json).toHaveBeenCalledWith(mockTodo, { status: 201 });
    });

    it('should return 400 if text is missing', async () => {
      // Setup
      const mockRequest = {
        json: jest.fn().mockResolvedValue({})
      };

      // Execute
      await POST(mockRequest as any);

      // Assert
      expect(storeModule.addTodo).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    });

    it('should return 400 if request body is invalid', async () => {
      // Setup
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };

      // Execute
      await POST(mockRequest as any);

      // Assert
      expect(storeModule.addTodo).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    });
  });

  describe('GET /api/todos/[id]', () => {
    it('should return a specific todo by id', async () => {
      // Setup
      (storeModule.getTodoById as jest.Mock).mockReturnValue(mockTodo);
      const mockRequest = {};
      const mockParams = { params: { id: '1' } };

      // Execute
      await GET_BY_ID(mockRequest as any, mockParams);

      // Assert
      expect(storeModule.getTodoById).toHaveBeenCalledWith('1');
      expect(NextResponse.json).toHaveBeenCalledWith(mockTodo);
    });

    it('should return 404 if todo is not found', async () => {
      // Setup
      (storeModule.getTodoById as jest.Mock).mockReturnValue(undefined);
      const mockRequest = {};
      const mockParams = { params: { id: '999' } };

      // Execute
      await GET_BY_ID(mockRequest as any, mockParams);

      // Assert
      expect(storeModule.getTodoById).toHaveBeenCalledWith('999');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Todo not found' },
        { status: 404 }
      );
    });
  });

  describe('PUT /api/todos/[id]', () => {
    it('should update a todo', async () => {
      // Setup
      const updatedTodo = { ...mockTodo, completed: true };
      (storeModule.updateTodo as jest.Mock).mockReturnValue(updatedTodo);
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ completed: true })
      };
      const mockParams = { params: { id: '1' } };

      // Execute
      await PUT(mockRequest as any, mockParams);

      // Assert
      expect(storeModule.updateTodo).toHaveBeenCalledWith('1', { completed: true });
      expect(NextResponse.json).toHaveBeenCalledWith(updatedTodo);
    });

    it('should return 404 if todo is not found', async () => {
      // Setup
      (storeModule.updateTodo as jest.Mock).mockReturnValue(null);
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ completed: true })
      };
      const mockParams = { params: { id: '999' } };

      // Execute
      await PUT(mockRequest as any, mockParams);

      // Assert
      expect(storeModule.updateTodo).toHaveBeenCalledWith('999', { completed: true });
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Todo not found' },
        { status: 404 }
      );
    });

    it('should return 400 if request body is invalid', async () => {
      // Setup
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      const mockParams = { params: { id: '1' } };

      // Execute
      await PUT(mockRequest as any, mockParams);

      // Assert
      expect(storeModule.updateTodo).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    });
  });

  describe('DELETE /api/todos/[id]', () => {
    it('should delete a todo', async () => {
      // Setup
      (storeModule.deleteTodo as jest.Mock).mockReturnValue(mockTodo);
      const mockRequest = {};
      const mockParams = { params: { id: '1' } };

      // Execute
      await DELETE(mockRequest as any, mockParams);

      // Assert
      expect(storeModule.deleteTodo).toHaveBeenCalledWith('1');
      expect(NextResponse.json).toHaveBeenCalledWith(mockTodo);
    });

    it('should return 404 if todo is not found', async () => {
      // Setup
      (storeModule.deleteTodo as jest.Mock).mockReturnValue(null);
      const mockRequest = {};
      const mockParams = { params: { id: '999' } };

      // Execute
      await DELETE(mockRequest as any, mockParams);

      // Assert
      expect(storeModule.deleteTodo).toHaveBeenCalledWith('999');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Todo not found' },
        { status: 404 }
      );
    });
  });
}); 