import express = require('express');
import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { CreateSeriesRequest, IHydratedSeries } from '../types/series';

import { seriesModel } from '../model/series';
import { lookupServices } from './services';

const seriesRouter = express.Router();

// GetAll Method
seriesRouter.get('/get/all', async (req: Request, res: Response) => {
  let skip = 0;
  const cursor = parseInt(req.params.cursor, 10) || 0;
  if (cursor > 0) {
    skip = cursor * 25;
  }
  const seriesLookup = await seriesModel.find().sort('seriesName').limit(26).skip(skip);
  let hasNextPage = false;
  if (seriesLookup.length === 26) {
    hasNextPage = true;
    seriesLookup.pop();
  }

  const hydratedSeries: Promise<IHydratedSeries>[] = seriesLookup.map(async (s) => {
    const hydratedServices = await lookupServices(s?.services);
    return {
      series: s,
      services: hydratedServices
    };
  });

  const findResults = {
    data: await Promise.all(hydratedSeries),
    hasNextPage,
    hasPreviousPage: cursor !== 0
  };
  res.status(200).json(findResults);
});

// Get by ID Method
seriesRouter.get('/get/:id', async (req: Request, res: Response) => {
  const series = await seriesModel.findOne({ _id: new Types.ObjectId(req.params.id) });

  const hydratedServices = await lookupServices(series?.services);
  res.status(200).json({ series, services: hydratedServices });
});

seriesRouter.post('/create', async (req: CreateSeriesRequest, res: Response) => {
  const { seriesName, description, image, credits, services, meta, lastScan } = req.body;
  try {
    const newSeries = new seriesModel({
      seriesName,
      description,
      image,
      credits,
      services,
      meta,
      lastScan
    });

    await newSeries.validate();

    const savedSeries = await newSeries.save();

    const hydratedServices = await lookupServices(services);
    res.status(200).json({ series: savedSeries, services: hydratedServices });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

seriesRouter.patch('/update/:id', async (req: CreateSeriesRequest, res: Response) => {
  const { seriesName, description, image, credits, services, meta, lastScan } = req.body;
  try {
    const convertedServices = services?.map((s) => {
      return new Types.ObjectId(s);
    });
    const series = await seriesModel.findOneAndUpdate(
      { _id: new Types.ObjectId(req.params.id) },
      {
        seriesName,
        description,
        image,
        credits,
        services: convertedServices,
        meta,
        lastScan
      }
    );
    if (series) {
      await series.validate();
      const updatedSeries = await series.save();

      const hydratedServices = await lookupServices(updatedSeries.services);

      res.status(200).json({ series: updatedSeries, services: hydratedServices });
    } else {
      res.status(404).json({ message: 'series with id:' + req.params.id + ' not found, sorry dude' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Search by name Method
// router.get('/get-name/:name', (req: Request, res: Response) => {
//   res.send('Get by ID API');
// });
//
// // Update by ID Method
// router.patch('/update/:id', (req: Request, res: Response) => {
//   res.send('Update by ID API');
// });
//
// // Delete by ID Method
// router.delete('/delete/:id', (req: Request, res: Response) => {
//   res.send('Delete by ID API');
// });

export { seriesRouter };
