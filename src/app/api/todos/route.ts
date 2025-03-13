import { NextRequest, NextResponse } from 'next/server';
import { getAllTodos, addTodo } from './store';

export async function GET() {
  return NextResponse.json(getAllTodos());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    const newTodo = addTodo(body.text);
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
} 