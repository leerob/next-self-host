import { NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { todos } from '@/app/db/schema';
import { revalidatePath } from 'next/cache';

export async function POST() {
  // Clear out the todos for the (public) demo
  // Because you can't trust an open <input> on the internet
  await db.delete(todos);
  revalidatePath('/db');

  return NextResponse.json({ message: 'All todos deleted successfully' });
}
