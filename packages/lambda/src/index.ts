import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// import { connectToServer } from '@justreadcomics/common/dist/db/conn';

export const searchAndScrapeCorpo = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // await connectToServer();

    console.log('heyyyyyy');

    const eventType = event.body ? JSON.parse(event.body).eventType : undefined;

    // switch (eventType) {
    //   case 'searchAndScrapeCorpo':
    //     searchAndScrapeCorpoAction(event.body.data);
    // }

    void eventType;

    return { statusCode: 501, body: JSON.stringify({ error: 'Not implemented' }) };
  } catch (error) {
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
