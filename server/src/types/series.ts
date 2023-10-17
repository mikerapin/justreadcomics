import { Request } from 'express';

interface GetSeriesById {
  id: string;
}

interface GetSeriesByIdRequest extends Request {
  body: GetSeriesById;
}

interface GetSeriesByName {
  name: string;
}

interface GetSeriesByNameRequest extends Request {
  body: GetSeriesByName;
}

export { GetSeriesByIdRequest, GetSeriesByNameRequest };
