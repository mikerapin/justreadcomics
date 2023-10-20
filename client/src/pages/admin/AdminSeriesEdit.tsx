import { redirectDocument, useParams } from 'react-router-dom';
import { useRef, useState } from 'react';
import { Creator, ISeries, ISeriesWithImageUpload } from '../../types/series';
import { createSeries, fetchSeriesById, updateSeriesById } from '../../data/series';
import { Toast } from 'bootstrap';
import { getCoverImage, getServiceImage } from '../../util/image';
import { useFieldArray, useForm } from 'react-hook-form';
import { fetchAllServices } from '../../data/services';
import { IService } from '../../types/service';
import { ImageUploader } from './subcomponents/ImageUploader';

interface ISeriesForm {
  seriesName?: string;
  description?: string;
  services?: string[];
  credits?: Creator[];
  imageBlob?: File[];
}

export const AdminSeriesEdit = () => {
  let { id } = useParams();

  const [series, setSeries] = useState<ISeries>();
  const [services, setServices] = useState<IService[]>();

  const rightColumnRef = useRef<HTMLDivElement>(null);
  const successToastRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, control, getValues } = useForm<ISeriesForm>({
    defaultValues: async () => {
      if (id) {
        return Promise.all([fetchSeriesById(id), fetchAllServices()]).then((result) => {
          const [fetchedSeries, fetchedServices] = result;
          setSeries(fetchedSeries.series);
          setServices(fetchedServices.data);
          const { seriesName, credits, services, description } = fetchedSeries.series;
          const foundServices = services || [];
          return { seriesName, credits, services: foundServices, description };
        });
      }
      fetchAllServices().then((fetchedServices) => {
        setServices(fetchedServices.data);
      });
      return {};
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: 'credits',
    control
  });

  const showToast = () => {
    if (successToastRef.current) {
      const toastBootstrap = new Toast(successToastRef.current);
      toastBootstrap.show();
    }
  };

  const saveSeries = handleSubmit((seriesForm) => {
    seriesForm.credits = seriesForm.credits?.filter((c) => c.name !== '' && c.role !== '');
    let file;
    if (seriesForm.imageBlob?.length) {
      file = seriesForm.imageBlob[0];
    }
    const updatedSeries: Partial<ISeriesWithImageUpload> = {
      ...series,
      ...seriesForm,
      imageBlob: file
    };

    let promise;
    if (id) {
      promise = updateSeriesById(updatedSeries);
    } else {
      promise = createSeries(updatedSeries);
    }
    promise.then((res) => {
      showToast();
      redirectDocument(`/admin/series/${res._id}`);
    });
  });

  const getNextOrder = () => {
    const currentCredits = getValues('credits');
    if (currentCredits) {
      return currentCredits.length;
    }
    return 2;
  };

  return (
    <div className="container">
      <form onSubmit={saveSeries}>
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mt-3 mb-3">Editing {series?.seriesName}</h3>
          <div>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-4 mb-3">
            {/* add click to view in modal \/\/\/ */}
            <img alt={series?.seriesName} className="img-fluid" src={getCoverImage(series)} />
            <ImageUploader register={register} fieldName={'imageBlob'} />
          </div>
          <div ref={rightColumnRef} className="col-md-8">
            <div className="mb-3">
              Last Scan: <strong>{series?.lastScan ? new Date(series.lastScan).toLocaleString() : 'Unknown'}</strong>
            </div>
            <div className="form-floating mb-3">
              <input {...register('seriesName')} className="form-control" id="seriesName" placeholder="X-Men (2023)" />
              <label htmlFor="seriesName">Series Name</label>
            </div>
            <div className="form-floating mb-3">
              <textarea {...register('description')} id="description" className="form-control" style={{ height: '160px' }}></textarea>
              <label htmlFor="description">Description</label>
            </div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span>Credits</span>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => append({ role: '', name: '', order: getNextOrder() })}>
                Add
              </button>
            </div>
            {fields.map((field, index) => (
              <div className="row g-2 align-items-center" key={field.id}>
                <div className="col-md form-floating mb-3">
                  <input className="form-control" id={`name-${field.id}`} {...register(`credits.${index}.name` as const)} />
                  <label htmlFor={`name-${field.id}`}>Name</label>
                </div>
                <div className="col-md form-floating mb-3">
                  <input className="form-control" id={`role-${field.id}`} {...register(`credits.${index}.role` as const)} />
                  <label htmlFor={`role-${field.id}`}>Role</label>
                </div>
                <input type="hidden" {...register(`credits.${index}.order` as const)} />
                <div className="col-1 d-flex align-items-center">
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(index)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: '28px' }}>
                      <path d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container">
          <h3>Services</h3>
          <div className="row">
            {services?.map((service) => {
              return (
                <div key={service.serviceName} className="col-2">
                  <label className="form-check-label" htmlFor={`service${service._id}`}>
                    <div className={`card`}>
                      <div className="m-3">
                        <img className="card-img-top bg-white" alt={service?.serviceName} src={getServiceImage(service)} />
                      </div>
                      <div className="card-body">
                        <p className="card-title text-center">{service.serviceName}</p>
                        <p className="text-center">
                          <input {...register('services')} id={`service${service._id}`} className="form-check-input" type="checkbox" value={service._id} />
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
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
