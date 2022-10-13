import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { todoExists, updateTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('auth')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const validTodo = await todoExists(todoId)
    if (validTodo.Count == 0) {
      logger.info(`User with id ${userId} performed update no existing todo id ${todoId} `);
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }
    const todo = await updateTodo(todoId, updatedTodo);
    logger.info(`User with id ${userId} performed update todo id ${todoId} `);
    return {
      statusCode: 200,
      body: JSON.stringify({
        item: todo
      })
    }
  })

handler
  .use(
    cors({
      credentials: true
    })
  )

