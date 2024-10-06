import { addTodoAction, deleteTodoAction } from './actions';
import { db } from './drizzle';
import { todos } from './schema';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let todoList = await db.select().from(todos).orderBy(todos.createdAt);

  return (
    <div>
      <h1>Todo List</h1>
      <form action={addTodoAction}>
        <input type="text" name="content" required />
        <button type="submit">Add Todo</button>
      </form>
      <ul>
        {todoList.map((todo) => (
          <li key={todo.id}>
            <span style={{ marginRight: '10px' }}>{todo.content}</span>
            <form action={deleteTodoAction} style={{ display: 'inline' }}>
              <input type="hidden" value={todo.id} name="id" />
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
