import { useEffect, useState } from 'react';
import { IGetAllSeriesWithCursor } from '../../types/series';
import { fetchAllSeries } from '../../data/series';
import { Link } from 'react-router-dom';
import { getServiceImage } from '../../util/image';

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
      console.log(hydratedSeries);
      const { _id, seriesName, lastScan } = hydratedSeries.series;
      return (
        <tr key={_id}>
          <td>
            <Link to={`/admin/series/${_id}`}>{seriesName}</Link>
          </td>
          <td>
            {hydratedSeries.services &&
              hydratedSeries.services.map((service) => {
                return (
                  <img
                    key={service._id}
                    style={{ maxHeight: '30px' }}
                    className="img-thumbnail rounded-2 bg-white"
                    src={getServiceImage(service)}
                    alt={service.serviceName}
                    title={service.serviceName}
                  />
                );
              })}
          </td>
          <td>{lastScan || 'Unknown'}</td>
          <td>
            <Link to={`/series/${_id}`} className="btn btn-sm btn-primary">
              Public
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
