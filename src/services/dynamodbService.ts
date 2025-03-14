import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { Todo } from '@/types/todo';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

// Get table name from environment variable or use default for local development
const tableName = process.env.TODO_TABLE_NAME || 'dev-todo-table';

/**
 * Convert Date objects to ISO strings for DynamoDB storage
 * Convert boolean to string for GSI compatibility
 */
const prepareTodoForDynamoDB = (todo: Todo): Record<string, unknown> => {
  return {
    ...todo,
    // Convert boolean to string for GSI compatibility
    completed: todo.completed ? 'true' : 'false',
    createdAt: todo.createdAt.toISOString(),
  };
};

/**
 * Convert ISO strings back to Date objects when retrieving from DynamoDB
 * Convert string back to boolean for completed field
 */
const convertDynamoDBItemToTodo = (item: Record<string, unknown>): Todo => {
  return {
    id: item.id as string,
    text: item.text as string,
    // Convert string back to boolean
    completed: item.completed === 'true' || item.completed === true,
    createdAt: new Date(item.createdAt as string),
  };
};

/**
 * Get all todos
 */
export const getAllTodos = async (): Promise<Todo[]> => {
  try {
    const command = new ScanCommand({
      TableName: tableName,
    });

    const response = await docClient.send(command);

    if (!response.Items) {
      return [];
    }

    return response.Items.map((item: Record<string, unknown>) => convertDynamoDBItemToTodo(item));
  } catch (error) {
    console.error('Error getting all todos from DynamoDB:', error);
    throw error;
  }
};

/**
 * Get a todo by ID
 */
export const getTodoById = async (id: string): Promise<Todo | undefined> => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { id },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return undefined;
    }

    return convertDynamoDBItemToTodo(response.Item);
  } catch (error) {
    console.error(`Error getting todo ${id} from DynamoDB:`, error);
    throw error;
  }
};

/**
 * Add a new todo
 */
export const addTodo = async (todo: Todo): Promise<Todo> => {
  try {
    const todoItem = prepareTodoForDynamoDB(todo);

    const command = new PutCommand({
      TableName: tableName,
      Item: todoItem,
    });

    await docClient.send(command);
    return todo;
  } catch (error) {
    console.error('Error adding todo to DynamoDB:', error);
    throw error;
  }
};

/**
 * Update a todo
 */
export const updateTodo = async (
  id: string,
  updates: Partial<Pick<Todo, 'text' | 'completed'>>
): Promise<Todo | null> => {
  try {
    // First, get the existing todo
    const existingTodo = await getTodoById(id);

    if (!existingTodo) {
      return null;
    }

    // Create updated todo
    const updatedTodo: Todo = {
      ...existingTodo,
      ...updates,
    };

    // Save to DynamoDB
    const todoItem = prepareTodoForDynamoDB(updatedTodo);

    const command = new PutCommand({
      TableName: tableName,
      Item: todoItem,
    });

    await docClient.send(command);
    return updatedTodo;
  } catch (error) {
    console.error(`Error updating todo ${id} in DynamoDB:`, error);
    throw error;
  }
};

/**
 * Delete a todo
 */
export const deleteTodo = async (id: string): Promise<Todo | null> => {
  try {
    // First, get the existing todo
    const existingTodo = await getTodoById(id);

    if (!existingTodo) {
      return null;
    }

    // Delete from DynamoDB
    const command = new DeleteCommand({
      TableName: tableName,
      Key: { id },
      ReturnValues: 'ALL_OLD',
    });

    const response = await docClient.send(command);

    if (!response.Attributes) {
      return null;
    }

    return convertDynamoDBItemToTodo(response.Attributes);
  } catch (error) {
    console.error(`Error deleting todo ${id} from DynamoDB:`, error);
    throw error;
  }
};

/**
 * Get todos by completion status
 */
export const getTodosByCompletionStatus = async (completed: boolean): Promise<Todo[]> => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: 'CompletedIndex',
      KeyConditionExpression: 'completed = :completed',
      ExpressionAttributeValues: {
        ':completed': completed ? 'true' : 'false',
      },
    });

    const response = await docClient.send(command);

    if (!response.Items) {
      return [];
    }

    return response.Items.map((item: Record<string, unknown>) => convertDynamoDBItemToTodo(item));
  } catch (error) {
    console.error(`Error querying todos by completion status (${completed}) from DynamoDB:`, error);
    throw error;
  }
};

/**
 * Clear all todos
 */
export const clearAllTodos = async (): Promise<void> => {
  try {
    // Get all todos
    const todos = await getAllTodos();

    // Delete each todo
    // Note: In a production environment, you might want to use a batch operation
    for (const todo of todos) {
      await deleteTodo(todo.id);
    }
  } catch (error) {
    console.error('Error clearing all todos from DynamoDB:', error);
    throw error;
  }
};
