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
  console.log(req.body);
  try {
    const newService = await new servicesModel({
      serviceName: req.body.serviceName,
      siteUrl: req.body.siteUrl
    });

    await newService.validate();
    const savedSeries = await newService.save();
    res.status(200).json(savedSeries);
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
