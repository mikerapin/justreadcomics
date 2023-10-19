import { redirectDocument, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { createService, fetchServiceById, updateServiceById } from '../../data/services';
import { IService, IServiceWithImageUpload, ServiceType } from '../../types/service';
import { getServiceImage } from '../../util/image';
import { useForm } from 'react-hook-form';
import { Toast } from 'bootstrap';
import { ImageUploader } from './subcomponents/ImageUploader';

interface IServiceForm {
  serviceName?: string;
  type?: ServiceType;
  siteUrl?: string;
  searchUrl?: string;
  imageBlob?: File[];
}

export const AdminServiceEdit = () => {
  let { id } = useParams();
  const [service, setService] = useState<IService>();
  const successToastRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit } = useForm<IServiceForm>({
    defaultValues: async () => {
      if (id) {
        return fetchServiceById(id).then((res) => {
          const { serviceName, type, siteUrl, searchUrl } = res;
          return { serviceName, type, siteUrl, searchUrl };
        });
      }
      return {};
    }
  });
  useEffect(() => {
    if (id) {
      fetchServiceById(id).then((res) => {
        setService(res);
      });
    }
  }, [id]);

  const showToast = () => {
    if (successToastRef.current) {
      const toastBootstrap = new Toast(successToastRef.current);
      toastBootstrap.show();
    }
  };

  const saveService = handleSubmit((serviceForm) => {
    let file;
    if (serviceForm.imageBlob?.length) {
      file = serviceForm.imageBlob[0];
    }
    const updatedService: Partial<IServiceWithImageUpload> = {
      ...service,
      ...serviceForm,
      imageBlob: file
    };
    let promise;
    if (id) {
      promise = updateServiceById(updatedService);
    } else {
      promise = createService(updatedService);
    }
    promise.then((res) => {
      showToast();
      redirectDocument(`/admin/service/${res._id}`);
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
            <img alt={service?.serviceName} className="img-fluid bg-white rounded-3" src={getServiceImage(service)} />
            <ImageUploader register={register} fieldName={'imageBlob'} />
          </div>
          <div className="col-md-8">
            <div className="form-floating mb-3">
              <input {...register('serviceName')} className="form-control" id="serviceName" placeholder="Hoopla" />
              <label htmlFor="serviceName">Service Name</label>
            </div>
            <div className="form-floating mb-3">
              <select id="type" className="form-select" {...register('type')}>
                <option value={ServiceType.FREE}>Free</option>
                <option value={ServiceType.PAID}>Paid</option>
                <option value={ServiceType.SUBSCRIPTION}>Subscription</option>
              </select>
              <label htmlFor="type">Service Type</label>
            </div>
            <div className="form-floating mb-3">
              <input {...register('siteUrl')} className="form-control" id="siteUrl" placeholder="https://google.com/" />
              <label htmlFor="siteUrl">Service Homepage</label>
            </div>
            <div className="form-floating mb-3">
              <input {...register('searchUrl')} className="form-control" id="searchUrl" placeholder="https://google.com/search?q=%s" />
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
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div ref={successToastRef} className="toast align-items-center text-bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="d-flex">
            <div className="toast-body">Successfully saved!</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      </div>
    </div>
  );
};
