import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Lambda handler function
 * @param event - API Gateway proxy event
 * @returns API Gateway proxy result
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

  try {
    // Parse request body if present
    const body = event.body ? JSON.parse(event.body) : {};
    
    // Get query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Get HTTP method
    const method = event.httpMethod;

    // Build response
    const response = {
      message: 'Hello from Think Twice Lambda!',
      timestamp: new Date().toISOString(),
      method: method,
      queryParams: queryParams,
      body: body,
      path: event.path,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
