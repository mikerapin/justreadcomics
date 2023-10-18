import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Creator, ISeries } from '../../types/series';
import { createSeries, fetchSeriesById, updateSeriesById } from '../../data/series';
import { Toast } from 'bootstrap';
import { getCoverImage } from '../../util/image';
import { useFieldArray, useForm } from 'react-hook-form';

interface ISeriesForm {
  seriesName?: string;
  description?: string;
  services?: string[];
  credits?: Creator[];
}

export const AdminSeriesEdit = () => {
  let { id } = useParams();

  const [series, setSeries] = useState<ISeries>();
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const rightColumnRef = useRef<HTMLDivElement>(null);
  const successToastRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, control, getValues } = useForm<ISeriesForm>({
    defaultValues: async () => {
      if (id) {
        return fetchSeriesById(id).then((result) => {
          setSeries(result.series);
          const { seriesName, credits, description } = result.series;
          return { seriesName, credits, description };
        });
      }
      return {};
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: 'credits',
    control
  });

  useEffect(() => {
    if (showSuccessToast && successToastRef.current) {
      const toastBootstrap = new Toast(successToastRef.current);
      console.log(toastBootstrap);
      toastBootstrap.show();
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    }
  }, [showSuccessToast]);

  const saveSeries = handleSubmit((seriesForm) => {
    seriesForm.credits = seriesForm.credits?.filter((c) => c.name !== '' && c.role !== '');
    if (id) {
      updateSeriesById({ _id: id, ...seriesForm }).then(() => {
        if (successToastRef.current) {
          const toastBootstrap = new Toast(successToastRef.current);
          toastBootstrap.show();
        }
      });
    } else {
      createSeries(seriesForm).then(() => {
        if (successToastRef.current) {
          const toastBootstrap = new Toast(successToastRef.current);
          toastBootstrap.show();
        }
      });
    }
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
            <img className="img-fluid" src={getCoverImage(series)} />
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
              <textarea {...register('description')} id="description" className="form-control"></textarea>
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
                <div className="col-1">
                  <button type="button" className={'btn btn-danger'} onClick={() => remove(index)}>
                    X
                  </button>
                </div>
              </div>
            ))}
            {/*{credits?.map((credit) => {*/}
            {/*  return <EditCreator key={uniqid()} credit={credit} updateCredits={updateCredits} removeCredit={removeCredit} />;*/}
            {/*})}*/}
          </div>
        </div>
      </form>
      <div ref={successToastRef} className="toast align-items-center text-bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex">
          <div className="toast-body">Successfully saved {series?.seriesName}</div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  );
};
