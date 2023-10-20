import express = require('express');
import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { CreateSeriesRequest, IHydratedSeries, ISeries } from '../types/series';

import { seriesModel } from '../model/series';
import { lookupServices } from './services';
import { escapeRegex } from '../util/util';
import { upload } from '../util/multer';
import { uploadImageToS3 } from '../s3/s3';
import { servicesModel } from '../model/services';

const seriesRouter = express.Router();

const getSeriesById = async (id: string) => {
  const series = await seriesModel.findOne({ _id: new Types.ObjectId(id) });
  if (!series) {
    return {};
  }

  const hydratedServices = await lookupServices(series.services);

  return { series, services: hydratedServices };
};

// GetAll Method
seriesRouter.get('/get/all', async (req: Request, res: Response) => {
  let skip = 0;
  const cursor = parseInt(req.params.cursor, 10) || 0;
  if (cursor > 0) {
    skip = cursor * 25;
  }
  const seriesLookup = await seriesModel.find().sort('seriesName').limit(51).skip(skip);
  let hasNextPage = false;
  if (seriesLookup.length === 51) {
    hasNextPage = true;
    seriesLookup.pop();
  }

  if (seriesLookup.length === 0) {
    res.status(200).json({});
    return;
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
  if (!req.params.id) {
    res.status(400).json({ msg: 'no id? no data' });
  }
  const results = await getSeriesById(req.params.id);
  if (Object.keys(results).length === 0) {
    res.status(404).json({ msg: 'nothing found, sorry', services: {}, series: {} });
    return;
  }
  res.status(200).json(results);
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

seriesRouter.patch('/update-image/:id', upload.single('imageBlob'), async (req, res) => {
  try {
    let fileUrl;
    if (req.file) {
      // upload file we received to S3 and get url to add to db
      fileUrl = await uploadImageToS3({
        image: req.file.buffer,
        filename: req.file.originalname || '',
        path: 'series/'
      });
    }

    const updatedSeries = await seriesModel.findOneAndUpdate(
      { _id: new Types.ObjectId(req.params.id) },
      {
        image: fileUrl
      }
    );

    if (updatedSeries) {
      await updatedSeries.validate();
      const savedService = await updatedSeries.save();
      res.status(200).json(savedService);
    } else {
      res.status(404).json({ message: 'series with id:' + req.params.id + ' not found, sorry dude' });
    }
  } catch (err: any) {
    res.status(400).json(err);
  }
});

seriesRouter.patch('/update/:id', async (req: CreateSeriesRequest, res: Response) => {
  const { seriesName, description, image, credits, services, meta, lastScan } = req.body;
  try {
    const series = await seriesModel.findOneAndUpdate(
      { _id: new Types.ObjectId(req.params.id) },
      {
        seriesName,
        description,
        image,
        credits,
        services,
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
seriesRouter.get('/get-name/:name', async (req: Request, res: Response) => {
  const { name } = req.params;

  // the frontend should prevent searching with less than 2 characters, but just in case...
  if (name.length < 2) {
    res.status(200).json();
  }
  const regex = new RegExp(escapeRegex(name), 'gi');
  const names = await seriesModel.find({ seriesName: regex }).limit(10);
  res.status(200).json(names);
});
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

export { getSeriesById, seriesRouter };
