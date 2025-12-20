// src/app/api/leave/route.ts
import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memory-store';

export async function POST(request: Request) {
  try {
    const { chatId, userId } = await request.json();

    if (!chatId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing chatId or userId' }, { status: 400 });
    }

    memoryStore.leaveChat(chatId, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Leave Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
