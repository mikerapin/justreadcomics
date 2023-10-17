import express = require('express');
import { Response } from 'express';

import { servicesModel } from '../model/services';
import { CreateServiceRequest, FindServicesRequest } from '../types/services';
import { Types } from 'mongoose';

const servicesRouter = express.Router();

const lookupServices = async (serviceIds?: string[]) => {
  if (!serviceIds) {
    return {};
  }
  const serviceObjectIds = serviceIds.map((id) => {
    return new Types.ObjectId(id);
  });
  return await servicesModel.find().all('_id', serviceObjectIds).exec();
};

servicesRouter.post('/create', async (req: CreateServiceRequest, res: Response) => {
  const { serviceName, siteUrl, image, type } = req.body;
  try {
    const newService = new servicesModel({
      serviceName,
      siteUrl,
      image,
      type
    });

    await newService.validate();
    const savedSeries = await newService.save();
    res.status(200).json(savedSeries);
  } catch (err: any) {
    res.status(400).json(err);
  }
});

servicesRouter.patch('/update/:id', async (req: CreateServiceRequest, res: Response) => {
  const { serviceName, siteUrl, image } = req.body;
  try {
    const updatedService = await servicesModel.findOneAndUpdate(
      { _id: new Types.ObjectId(req.params.id) },
      {
        serviceName,
        siteUrl,
        image
      }
    );

    if (updatedService) {
      await updatedService.validate();
      const savedService = await updatedService.save();
      res.status(200).json(savedService);
    } else {
      res.status(404).json({ message: 'service with id:' + req.params.id + ' not found, sorry dude' });
    }
  } catch (err: any) {
    res.status(400).json(err);
  }
});

servicesRouter.post('/lookup', async (req: FindServicesRequest, res: Response) => {
  const servicesProvided = req.body.serviceIds;
  try {
    const services = await lookupServices(servicesProvided);
    res.status(200).json(services);
  } catch (error: any) {
    res.status(400).json(error);
  }
});

export { lookupServices, servicesRouter };
