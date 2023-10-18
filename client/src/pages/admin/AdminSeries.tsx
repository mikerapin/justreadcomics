import { useEffect, useState } from 'react';
import { IGetAllSeriesWithCursor } from '../../types/series';
import { fetchAllSeries } from '../../data/series';
import { Link } from 'react-router-dom';

export const AdminSeries = () => {
  const [seriesList, setSeriesList] = useState<IGetAllSeriesWithCursor>();
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    fetchAllSeries(cursor).then((res) => {
      setSeriesList(res);
    });
  }, [cursor]);

  const renderSeries = () => {
    if (!seriesList) {
      return null;
    }

    return seriesList.data.map((hydratedSeries) => {
      return (
        <tr key={hydratedSeries.series._id}>
          <td>{hydratedSeries.series.seriesName}</td>
          <td>
            {hydratedSeries.services &&
              hydratedSeries.services.map((service) => {
                return (
                  <img
                    key={service._id}
                    style={{ maxHeight: '30px' }}
                    className="img-thumbnail rounded-2 bg-whit"
                    src={`/img/services/${service.image}`}
                    alt={service.serviceName}
                  />
                );
              })}
          </td>
          <td>{hydratedSeries.series.lastScan || 'Unknown'}</td>
          <td>
            <Link to={`/admin/series/${hydratedSeries.series._id}`} className="btn btn-sm btn-primary">
              Edit
            </Link>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-end">
        <Link to="/admin/series/new" type="button" className="btn btn-primary">
          + Add
        </Link>
      </div>
      <div className="series content">
        <table className="table table-striped table-hover table-responsive align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Services</th>
              <th>Last Scan</th>
              <th></th>
            </tr>
          </thead>
          <tbody>{renderSeries()}</tbody>
        </table>
      </div>
    </div>
  );
};
