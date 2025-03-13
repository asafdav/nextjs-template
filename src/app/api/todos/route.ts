import { NextResponse } from 'next/server';
import { getAllTodos, addTodo, clearAllTodos } from './store';

export async function GET() {
  return NextResponse.json(getAllTodos());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'Text is required and must be a string' }, { status: 400 });
    }

    const newTodo = addTodo(body.text);
    return NextResponse.json(newTodo, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE() {
  clearAllTodos();
  return NextResponse.json({ message: 'All todos cleared successfully' });
}
