import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

// TODO: Implement the dataLayer logic

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly userIdIndex = process.env.USER_ID_INDEX
      ) {
    }
  
    async getTodosForUser(userId: string): Promise<TodoItem[]> {
      
      console.log('Getting all todos for user');

      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()

    return result.Items as TodoItem[];
    }
  
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise()
  
      return todoItem
    }

    async updateTodo(todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoUpdate> {
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
           todoId: todoId
        },
        UpdateExpression: 'set #namefield = :n, duDate = :d, done = :done',
        ExpressionAttributeValues: {
            ':n': updateTodoRequest.name,
            'd:': updateTodoRequest.dueDate,
            'done': updateTodoRequest.done
        },
        ExpressionAttributeNames: {
          "#namefield": "name"
        }
      }).promise()


      return updateTodoRequest
    }

    async deleteTodo(todoId: string): Promise<string> {
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
           'todoId': todoId
        },
      }).promise()

      return "Todo deleted";
    }

    async getTodo(todoId: string) {
      return await this.docClient
        .query({
          TableName: this.todosTable,
          KeyConditionExpression: 'todoId = :todoId',
          ExpressionAttributeValues: {
              ':todoId': todoId
          }
        }).promise()
    }
  }
  
  
  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }