import { IGetAllServicesWithCursor, IService, IServiceWithImageUpload } from '../types/service';
import { API_BASE_URL } from '../static/const';
import { authFetch } from './fetch';

export const fetchAllServices = async (cursor?: number): Promise<IGetAllServicesWithCursor> => {
  const c = cursor || 0;
  const res = await fetch(`${API_BASE_URL}/services/get/all?cursor=${c}`);
  return await res.json();
};

export const fetchServiceById = async (id: string): Promise<IService> => {
  const res = await fetch(`${API_BASE_URL}/services/get/${id}`);
  return await res.json();
};

const uploadServiceImage = async (service: IService, imageBlob: File) => {
  const formData = new FormData();

  const filename = `${service.serviceName}.${imageBlob.name.split('.').pop()}`.toLowerCase();

  formData.append('imageBlob', imageBlob, filename);

  const res = await authFetch(`${API_BASE_URL}/services/update-image/${service._id}`, {
    method: 'PATCH',
    body: formData
  });
  return res.json();
  // delete the imageBlob from the object here?
  // delete service.imageBlob;
};

export const updateServiceById = async (service: Partial<IServiceWithImageUpload>) => {
  const res = await authFetch(`${API_BASE_URL}/services/update/${service._id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: JSON.stringify(service)
  });

  if (service.imageBlob) {
    const updatedService: IService = await res.json();
    return uploadServiceImage(updatedService, service.imageBlob);
  }
  return res.json();
};

export const createService = async (service: Partial<IServiceWithImageUpload>) => {
  const res = await authFetch(`${API_BASE_URL}/services/create`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(service)
  });

  if (service.imageBlob) {
    const updatedService: IService = await res.json();
    return uploadServiceImage(updatedService, service.imageBlob);
  }
  return res.json();
};
