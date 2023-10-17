import express = require('express');
import { Response } from 'express';
import { Types } from 'mongoose';

import { GetSeriesByIdRequest, GetSeriesByNameRequest } from '../types/series';

import { seriesModel } from '../model/series';

const app = express();

app.post('/create', async (req: GetSeriesByNameRequest, res: Response) => {
  try {
    console.log(req.body);
    const data = new seriesModel({
      seriesName: req.body.name
    });

    await data.validate();

    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get by ID Method
app.get('/get/:id', async (req: GetSeriesByIdRequest, res: Response) => {
  const series = await seriesModel.findOne({ _id: new Types.ObjectId(req.body.id) });
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
