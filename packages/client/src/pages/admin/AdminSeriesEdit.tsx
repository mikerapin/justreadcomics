import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import React, { useRef, useState } from 'react';
import { ISeries, ISeriesService, ISeriesWithImageUpload } from '../../types/series';
import { createSeries, fetchSeriesById, updateSeriesById } from '../../data/series';
import { Toast } from 'bootstrap';
import { getServiceImage } from '../../util/image';
import { useFieldArray, useForm } from 'react-hook-form';
import { fetchAllServices } from '../../data/services';
import { IService } from '../../types/service';
import { ImageUploader } from './subcomponents/ImageUploader';
import { ISeriesForm } from './types/series';
import { SeriesImage } from '../../components/SeriesImage';
import { Scanner } from './series-service/Scanner';

const getSeriesServiceStringArray = (seriesServices?: ISeriesService[]) => {
  return (
    seriesServices?.map((service) => {
      return service._id;
    }) || []
  );
};
export const AdminSeriesEdit = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [series, setSeries] = useState<ISeries>();
  const [services, setServices] = useState<IService[]>();

  const rightColumnRef = useRef<HTMLDivElement>(null);
  const successToastRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { isDirty }
  } = useForm<ISeriesForm>({
    defaultValues: async () => {
      if (id) {
        return Promise.all([fetchSeriesById(id), fetchAllServices()]).then((result) => {
          const [fetchedSeries, fetchedServices] = result;
          setSeries(fetchedSeries.series);
          setServices(fetchedServices.data);

          const seriesServices = getSeriesServiceStringArray(fetchedSeries.series.services);
          const { seriesName, credits, description } = fetchedSeries.series;
          return { seriesName, credits, services: seriesServices, description };
        });
      }
      fetchAllServices().then((fetchedServices) => {
        setServices(fetchedServices.data);
      });
      return {};
    }
  });

  const {
    fields: creditsFields,
    append: appendCredit,
    remove: removeCredit
  } = useFieldArray({
    name: 'credits',
    control
  });

  if (!series) {
    return <span>'Loading'</span>;
  }

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

    const newServices = seriesForm.services?.map((serviceId) => {
      const existingService = series.services?.filter((s) => s._id === serviceId);
      if (existingService?.[0]) {
        return existingService[0];
      }
      return { _id: serviceId };
    });

    const updatedSeries: Partial<ISeriesWithImageUpload> = {
      ...series,
      ...seriesForm,
      services: newServices,
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
      setSeries(res.series);
      setValue('services', getSeriesServiceStringArray(res.series.services));
    });
  });

  const getNextOrder = () => {
    const currentCredits = getValues('credits');
    if (currentCredits) {
      return currentCredits.length;
    }
    return 2;
  };

  const getSeriesServiceById = (serviceId?: string) => {
    return series.services?.find((service) => service._id === serviceId);
  };

  const getSeriesPageUrl = (serviceId?: string) => {
    const seriesService = getSeriesServiceById(serviceId);
    if (seriesService && seriesService.seriesServiceUrl) {
      return (
        <a target="_blank" rel="nofollow noreferrer" href={seriesService.seriesServiceUrl}>
          Series Page
        </a>
      );
    }
    return <></>;
  };

  const updateSeriesData = (series: ISeries) => {
    navigate(location);
  }

  return (
    <div className="container">
      <form onSubmit={saveSeries}>
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mt-3 mb-3">Editing {series?.seriesName}</h3>
          <div>
            <button type="submit" className="btn btn-primary" disabled={!isDirty}>
              Save
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-4 mb-3">
            {/* add click to view in modal \/\/\/ */}
            <SeriesImage series={series} alt={series.seriesName} />
            <ImageUploader register={register} fieldName={'imageBlob'} />
          </div>
          <div ref={rightColumnRef} className="col-md-8">
            <div className="mb-3">
              <Link to={`/series/${series._id}`}>Public Page</Link>
            </div>
            <div className="mb-3">
              ID: <code>{series._id}</code>
            </div>
            <div className="mb-3">
              Last Scan: <code>{series?.lastScan ? new Date(series.lastScan).toLocaleString() : 'Unknown'}</code>
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
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => appendCredit({ role: '', name: '', order: getNextOrder() })}>
                Add
              </button>
            </div>
            {creditsFields.map((credits, index) => (
              <div className="row g-2 align-items-center" key={credits.id}>
                <div className="col-md form-floating mb-3">
                  <input className="form-control" id={`name-${credits.id}`} {...register(`credits.${index}.name` as const)} />
                  <label htmlFor={`name-${credits.id}`}>Name</label>
                </div>
                <div className="col-md form-floating mb-3">
                  <input className="form-control" id={`role-${credits.id}`} {...register(`credits.${index}.role` as const)} />
                  <label htmlFor={`role-${credits.id}`}>Role</label>
                </div>
                <input type="hidden" {...register(`credits.${index}.order` as const)} />
                <div className="col-1 d-flex align-items-center">
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeCredit(index)}>
                    <i className="bi bi-dash-circle"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container">
          <h3>Services</h3>
          <table className="table table-striped table-hover table-responsive align-middle">
            <tbody>
              {services?.map((service) => {
                return (
                  <tr key={service.serviceName}>
                    <td>
                      <input {...register(`services`)} id={`service${service._id}`} className="form-check-input" type="checkbox" value={service._id} />
                    </td>
                    <td>
                      <label className="form-check-label" htmlFor={`service${service._id}`}>
                        <img className="bg-white img-thumbnail" alt={service?.serviceName} style={{ maxWidth: '32px' }} src={getServiceImage(service)} />
                      </label>
                    </td>
                    <td>
                      <label className="form-check-label" htmlFor={`service${service._id}`}>
                        <p className="card-title text-center">{service.serviceName}</p>
                      </label>
                      {/*<label className="form-check-label" htmlFor={`service${service._id}`}>*/}
                      {/*  <div className="text-center"></div>*/}
                      {/*</label>*/}
                    </td>
                    <td>{getSeriesPageUrl(service._id)}</td>
                    <td style={{ fontSize: '12px' }}>
                      Last Scan: <code>{getSeriesServiceById(service._id)?.lastScan}</code>
                    </td>
                    <td>
                      <Scanner seriesService={getSeriesServiceById(service._id)} seriesId={series._id} scannerResultCallback={updateSeriesData} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
