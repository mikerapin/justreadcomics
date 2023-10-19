import { IGetAllServicesWithCursor, IService } from '../types/service';
import { API_BASE_URL } from '../static/const';

export const fetchAllServices = async (cursor?: number): Promise<IGetAllServicesWithCursor> => {
  const c = cursor || 0;
  const res = await fetch(`${API_BASE_URL}/services/get/all?cursor=${c}`);
  return await res.json();
};

export const fetchServiceById = async (id: string): Promise<IService> => {
  const res = await fetch(`${API_BASE_URL}/services/get/${id}`);
  return await res.json();
};

export const updateServiceById = async (service: Partial<IService>) => {
  const res = await fetch(`${API_BASE_URL}/services/update/${service._id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: JSON.stringify(service)
  });
  return res.json();
};

export const createService = async (service: Partial<IService>) => {
  const res = await fetch(`${API_BASE_URL}/services/create`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(service)
  });
  return res.json();
};
