import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils';
import { TodoUpdate } from '../models/TodoUpdate'
import { getTodoAttachmentUrl } from './attachmentUtils'
import { createLogger } from '../utils/logger'

// TODO: Implement businessLogic

const todoAccess = new TodosAccess()

const logger = createLogger('auth')

export async function getTodosForUser(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)

  logger.info(`Get all todos for user ${userId}`);

  const todos = await todoAccess.getTodosForUser(userId);

 for (const todo of todos) {
  todo.attachmentUrl = await getTodoAttachmentUrl(todo.todoId)
 }
 return todos;
}

export async function createTodo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {

  const todoId = uuid.v4();
  const userId = parseUserId(jwtToken)

  logger.info(`Create todo for user ${userId}`);

  return await todoAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: true,
  });
}

export async function updateTodo(todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoUpdate> {
  return await todoAccess.updateTodo(todoId, updateTodoRequest);
}

export async function deleteTodo(todoId: string): Promise<string> {
  return await todoAccess.deleteTodo(todoId);
}

export async function todoExists(todoId: string) {
  return await todoAccess.getTodo(todoId);
}