import express from 'express';
import { Request, Response } from 'express';

import { servicesModel } from '../model/services';
import { CreateServiceRequest, FindServicesRequest, IService } from '../types/services';
import { Types } from 'mongoose';
import { upload } from '../util/multer';
import { uploadImageToS3 } from '../s3/s3';
import { verifyTokenMiddleware } from '../middleware/auth';

const servicesRouter = express.Router();

const lookupServices = async (serviceIds?: string[]): Promise<IService[] | object> => {
  if (serviceIds && serviceIds.length) {
    return servicesModel.find({ _id: { $in: serviceIds } });
  }
  return {};
};

servicesRouter.get('/get/all', async (req: Request, res: Response) => {
  let skip = 0;
  const cursor = parseInt(req.params.cursor, 10) || 0;
  if (cursor > 0) {
    skip = cursor * 100;
  }

  // no need to limit this because it's going to be pretty finite
  const servicesLookup = await servicesModel.find().sort('serviceName').limit(101).skip(skip);
  let hasNextPage = false;
  if (servicesLookup.length === 101) {
    hasNextPage = true;
    servicesLookup.pop();
  }

  const findResults = {
    data: servicesLookup,
    hasNextPage,
    hasPreviousPage: cursor !== 0
  };
  res.status(200).json(findResults);
});

servicesRouter.get('/get/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: 'no id, bub?' });
    return;
  }
  const service = await servicesModel.findOne({ _id: new Types.ObjectId(id) });

  res.status(200).json(service);
});

servicesRouter.post('/create', [verifyTokenMiddleware], upload.single('imageBlob'), async (req: CreateServiceRequest, res: Response) => {
  const { serviceName, siteUrl, searchUrl, type } = req.body;
  try {
    let fileUrl;
    if (req.file) {
      // upload file we received to S3 and get url to add to db
      fileUrl = await uploadImageToS3({
        image: req.file?.buffer,
        filename: req.file?.originalname || '',
        path: 'services/'
      });
    }

    // create service
    const newService = new servicesModel({
      serviceName,
      siteUrl,
      image: fileUrl,
      searchUrl,
      type
    });

    await newService.validate();
    const savedSeries = await newService.save();

    res.status(200).json(savedSeries);
  } catch (err: any) {
    res.status(400).json(err);
  }
});

servicesRouter.patch('/update-image/:id', [verifyTokenMiddleware], upload.single('imageBlob'), async (req: Request, res: Response) => {
  try {
    let fileUrl;
    if (req.file) {
      // upload file we received to S3 and get url to add to db
      fileUrl = await uploadImageToS3({
        image: req.file.buffer,
        filename: req.file.originalname || '',
        path: 'services/'
      });
    }

    const updatedService = await servicesModel.findOneAndUpdate(
      { _id: new Types.ObjectId(req.params.id) },
      {
        image: fileUrl
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

servicesRouter.patch('/update/:id', [verifyTokenMiddleware], async (req: CreateServiceRequest, res: Response) => {
  const { serviceName, siteUrl, image, type, searchUrl } = req.body;
  try {
    const updatedService = await servicesModel.findOneAndUpdate(
      { _id: new Types.ObjectId(req.params.id) },
      {
        serviceName,
        siteUrl,
        type,
        searchUrl
      },
      {
        // this ensures we return the UPDATED document *sigh*
        new: true
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
