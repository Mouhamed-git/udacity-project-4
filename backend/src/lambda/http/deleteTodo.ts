import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { deleteTodo, todoExists } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('auth')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const todo = await todoExists(todoId)
    if (todo.Count == 0) {
      logger.info(`User with id ${userId} performed delete no existing todo id ${todoId} `);
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }
    await deleteTodo(todoId);
    logger.info(`User with id ${userId} performed delete todo id ${todoId} `);
    return {
      statusCode: 202,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        Success: `Todo with id ${todoId} deleted succesffuly`
      })
    }
  })

handler
  .use(
    cors({
      credentials: true
    })
  )
