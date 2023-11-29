import { useEffect, useState } from 'react';
import { fetchAllServices } from '../../data/services';
import { IGetAllServicesWithCursor } from '../../types/service';
import { Link } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import { ServiceImage } from '../../components/ServiceImage';

export const AdminService = () => {
  const [servicesList, setServicesList] = useState<IGetAllServicesWithCursor>();
  useEffect(() => {
    fetchAllServices().then((res) => {
      setServicesList(res);
    });
  }, []);

  const renderServices = () => {
    if (!servicesList) {
      return null;
    }
    return servicesList.data.map((service) => {
      return (
        <tr key={service._id}>
          <td>
            <ServiceImage service={service} size="xs" />
          </td>
          <td>{service.serviceName}</td>
          <td>
            <small>
              <a target="_blank" rel="nofollow noreferrer" href={service.siteUrl}>
                {service.siteUrl}
              </a>
            </small>
          </td>
          <td>[Search box here]</td>
          <td>
            <Link className="btn btn-sm btn-primary" to={`/admin/service/${service._id}`}>
              Edit
            </Link>
          </td>
        </tr>
      );
    });
  };

  return (
    <Container className="container">
      <div className="d-flex justify-content-end">
        <Link to="/admin/service/new" type="button" className="btn btn-primary">
          + Add
        </Link>
      </div>
      <div className="series content">
        <Table striped hover responsive className="align-middle">
          <thead>
            <tr>
              <th></th>
              <th>Service</th>
              <th>Site</th>
              <th>Search</th>
              <th></th>
            </tr>
          </thead>
          <tbody>{renderServices()}</tbody>
        </Table>
      </div>
    </Container>
  );
};
