import { useParams } from 'react-router-dom';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Creator, ISeries } from '../../types/series';
import { IService } from '../../types/service';
import { fetchSeriesById, updateSeriesById } from '../../data/series';
import { EditCreator } from './subcomponents/EditCreator';
import uniqid from 'uniqid';
import { Toast } from 'bootstrap';
import { getCoverImage } from '../../util/image';

export const AdminSeriesEdit = () => {
  let { id } = useParams();
  const [series, setSeries] = useState<ISeries>();
  const [credits, setCredits] = useState<Creator[]>();
  const [services, setServices] = useState<IService[]>();
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const rightColumnRef = useRef<HTMLDivElement>(null);
  const successToastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchSeriesById(id).then((result) => {
        setSeries(result.series);
        setCredits(
          result.series.credits.sort((a: Creator, b: Creator) => {
            if (a && b) {
              return a.order - b.order;
            }
            return 0;
          })
        );
        setServices(result.services);
      });
    }
  }, [id]);

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

  if (!series) {
    return <></>;
  }

  const appendMoreCreditsToPage = () => {
    const newCredits = [...(credits || [])];
    let nextOrder = 1;
    if (newCredits.length) {
      newCredits.sort((a, b) => {
        if (a && b) {
          return a.order - b.order;
        }
        return 0;
      });
      nextOrder = newCredits[newCredits.length - 1].order + 1;
    }
    newCredits.push({
      order: nextOrder,
      name: '',
      role: ''
    });
    setCredits(newCredits);
  };

  const saveSeries = () => {
    const updatedSeries = series;
    updatedSeries.credits = credits?.filter((c) => c.name !== '' && c.role !== '');
    updateSeriesById(series).then(() => {
      if (successToastRef.current) {
        const toastBootstrap = new Toast(successToastRef.current);
        toastBootstrap.show();
      }
    });
  };

  const updateSeriesName = (e: ChangeEvent<HTMLInputElement>) => {
    const updatedSeries = series;
    updatedSeries.seriesName = e.target.value;
    setSeries(updatedSeries);
  };

  const updateCredits = (updatedCredit: Creator) => {
    const newCredits = [...(credits || [])];
    const index = credits?.findIndex((c) => c.order === updatedCredit.order) || 0;
    newCredits[index] = updatedCredit;
    setCredits(newCredits);
  };

  const removeCredit = (order: number) => {
    const newCredits = [...(credits || [])];
    const index = credits?.findIndex((c) => c.order === order) || 0;

    if (index === newCredits.length - 1) {
      newCredits.pop();
      setCredits(newCredits);
    } else {
      newCredits.splice(index, 1);
      const updatedCredits = newCredits.map((c, i) => {
        c.order = i + 1;
        return c;
      });
      setCredits(updatedCredits);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="mt-3 mb-3">Editing {series.seriesName}</h3>
        <div>
          <button className="btn btn-primary" onClick={saveSeries}>
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
            Last Scan: <strong>{series.lastScan ? new Date(series.lastScan).toLocaleString() : 'Unknown'}</strong>
          </div>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="seriesName"
              defaultValue={series.seriesName}
              placeholder="X-Men (2023)"
              onChange={updateSeriesName}
            />
            <label htmlFor="seriesName">Series Name</label>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span>Credits</span>
            <button type="button" className="btn btn-sm btn-secondary" onClick={appendMoreCreditsToPage}>
              Add
            </button>
          </div>
          {credits?.map((credit) => {
            return <EditCreator key={uniqid()} credit={credit} updateCredits={updateCredits} removeCredit={removeCredit} />;
          })}
        </div>
      </div>
      <div ref={successToastRef} className="toast align-items-center text-bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex">
          <div className="toast-body">Successfully saved {series.seriesName}</div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  );
};
