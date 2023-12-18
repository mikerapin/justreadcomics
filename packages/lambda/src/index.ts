import { connectToServer } from '@justreadcomics/common/dist/db/conn';

export const handler = async (event: any) => {
  try {
    await connectToServer();

    const eventType = event.body.eventType;

    // switch (eventType) {
    //   case 'searchAndScrapeCorpo':
    //     searchAndScrapeCorpoAction(event.body.data);
    // }

    return { statusCode: 200, body: JSON.stringify({ beans: 'cool' }) };
  } catch (error) {
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
