'use server';

import { revalidatePath } from 'next/cache';
import { db } from './drizzle';
import { todos } from './schema';
import { eq } from 'drizzle-orm';

export async function addTodoAction(formData: FormData) {
  const content = formData.get('content') as string;
  await db.insert(todos).values({ content });
  revalidatePath('/db');
}

export async function deleteTodoAction(formData: FormData) {
  const id = formData.get('id') as string;
  await db.delete(todos).where(eq(todos.id, Number(id)));
  revalidatePath('/db');
}
