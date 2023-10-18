import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchServiceById, updateServiceById } from '../../data/services';
import { IService, ServiceType } from '../../types/service';
import { getServiceImage } from '../../util/image';
import { useForm } from 'react-hook-form';

interface IServiceForm {
  serviceName: string;
  type: ServiceType;
  siteUrl: string;
  searchUrl: string;
}

export const AdminServiceEdit = () => {
  const { register, handleSubmit } = useForm<IServiceForm>();
  let { id } = useParams();
  const [service, setService] = useState<IService>();
  useEffect(() => {
    if (id) {
      fetchServiceById(id).then((res) => {
        setService(res);
      });
    }
  }, [id]);

  if (!service) {
    {
      /* TODO: create loader for these pages */
    }
    return <div>Loading</div>;
  }

  const saveService = handleSubmit((serviceForm) => {
    const updatedService: Partial<IService> = {
      ...service,
      ...serviceForm
    };
    console.log({ service, serviceForm, updatedService });
    updateServiceById(updatedService).then(() => {
      console.log('show toast');
    });
  });

  return (
    <div className="container">
      <form onSubmit={saveService}>
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mt-3 mb-3">Editing Service: {service?.serviceName}</h3>
          <div>
            <button className="btn btn-primary" type="submit">
              Save
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-4 mb-3">
            {/* add click to view in modal \/\/\/ */}
            <img alt={service.serviceName} className="img-fluid bg-white rounded-3" src={`/img/services/${getServiceImage(service)}`} />
          </div>
          <div className="col-md-8">
            <div className="form-floating mb-3">
              <input {...register('serviceName')} className="form-control" id="serviceName" defaultValue={service.serviceName} placeholder="Hoopla" />
              <label htmlFor="serviceName">Service Name</label>
            </div>
            <div className="form-floating mb-3">
              <select id="type" className="form-select" {...register('type')} value={service.type}>
                <option value={ServiceType.FREE}>Free</option>
                <option value={ServiceType.PAID}>Paid</option>
                <option value={ServiceType.SUBSCRIPTION}>Subscription</option>
              </select>
              <label htmlFor="type">Service Type</label>
            </div>
            <div className="form-floating mb-3">
              <input {...register('siteUrl')} className="form-control" id="siteUrl" defaultValue={service.siteUrl} placeholder="https://google.com/" />
              <label htmlFor="siteUrl">Service Homepage</label>
            </div>
            <div className="form-floating mb-3">
              <input
                {...register('searchUrl')}
                className="form-control"
                id="searchUrl"
                defaultValue={service.searchUrl}
                placeholder="https://google.com/search?q=%s"
              />
              <label htmlFor="searchUrl">Search URL</label>
              <sub>
                This will be used to perform automated searches. Please include the search query with <strong>%s</strong> in the URL to search against.
              </sub>
              <br />
              <sub>
                ex: https://www.google.com/search<strong>?q=%s</strong>
              </sub>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
