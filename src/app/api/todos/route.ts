import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as dynamodbService from '@/services/dynamodbService';
import { Todo } from '@/types/todo';

export async function GET() {
  try {
    const todos = await dynamodbService.getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'Text is required and must be a string' }, { status: 400 });
    }

    const newTodo: Todo = {
      id: uuidv4(),
      text: body.text,
      completed: false,
      createdAt: new Date(),
    };

    const savedTodo = await dynamodbService.addTodo(newTodo);
    return NextResponse.json(savedTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);

    if (error instanceof Error && error.message.includes('JSON')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dynamodbService.clearAllTodos();
    return NextResponse.json({ message: 'All todos cleared successfully' });
  } catch (error) {
    console.error('Error clearing todos:', error);
    return NextResponse.json({ error: 'Failed to clear todos' }, { status: 500 });
  }
}
