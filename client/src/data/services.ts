import { IGetAllServicesCursor, IService } from '../types/service';
import { API_BASE_URL } from '../static/const';

export const fetchAllServices = async (cursor = 0): Promise<IGetAllServicesCursor> => {
  const res = await fetch(`${API_BASE_URL}/services/get/all?cursor=${cursor}`);
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
