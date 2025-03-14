import { NextResponse } from 'next/server';
import * as dynamodbService from '@/services/dynamodbService';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const todo = await dynamodbService.getTodoById(id);

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error(`Error fetching todo ${(await params).id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch todo' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await request.json();

    const updates = {
      ...(body.text && { text: body.text }),
      ...(body.completed !== undefined && { completed: !!body.completed }),
    };

    const updatedTodo = await dynamodbService.updateTodo(id, updates);

    if (!updatedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error(`Error updating todo ${(await params).id}:`, error);

    // Check if it's a JSON parsing error
    if (error instanceof Error && error.message.includes('JSON')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const deletedTodo = await dynamodbService.deleteTodo(id);

    if (!deletedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(deletedTodo);
  } catch (error) {
    console.error(`Error deleting todo ${(await params).id}:`, error);
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
