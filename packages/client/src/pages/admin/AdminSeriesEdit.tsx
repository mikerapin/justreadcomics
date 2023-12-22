import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import React, { useCallback, useRef, useState } from 'react';
import { IClientSeries, IClientSeriesService, ISeriesWithImageUpload } from '../../types/series';
import { createSeries, fetchSeriesById, updateSeriesById } from '../../data/series';
import { useFieldArray, useForm } from 'react-hook-form';
import { fetchAllServices } from '../../data/services';
import { IClientService } from '../../types/service';
import { ImageUploader } from './subcomponents/ImageUploader';
import { ISeriesForm } from './types/series';
import { SeriesImage } from '../../components/SeriesImage';
import { Scanner } from './series-service/Scanner';
import { Button, Col, Container, FloatingLabel, Form, Row, Stack, Table, Toast, ToastContainer } from 'react-bootstrap';
import { ServiceImage } from '../../components/ServiceImage';

const getSeriesServiceStringArray = (seriesServices?: IClientSeriesService[]) => {
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

  const [series, setSeries] = useState<IClientSeries>();
  const [services, setServices] = useState<IClientService[]>();

  const rightColumnRef = useRef<HTMLDivElement>(null);

  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  const getSeriesServiceById = useCallback(
    (serviceId?: string) => {
      return series?.services?.find((service) => service._id === serviceId);
    },
    [series]
  );

  if (!series) {
    return <span>'Loading'</span>;
  }

  const showToast = () => {
    setShowSuccessToast(true);
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

  const updateSeriesData = (series: IClientSeries) => {
    navigate(location);
  };

  return (
    <Container className="container">
      <Form onSubmit={saveSeries}>
        <Stack direction="horizontal" className="justify-content-between align-items-center">
          <h3 className="mt-3 mb-3">Editing {series?.seriesName}</h3>
          <Button variant="primary" type="submit" disabled={!isDirty}>
            Save
          </Button>
        </Stack>
        <Row className="row">
          <Col xs={4} className="mb-3">
            {/* add click to view in modal \/\/\/ */}
            <SeriesImage series={series} alt={series.seriesName} />
            <ImageUploader register={register} fieldName={'imageBlob'} />
          </Col>
          <Col ref={rightColumnRef}>
            <div className="mb-3">
              <Link to={`/series/${series._id}`}>Public Page</Link>
            </div>
            <div className="mb-3">
              ID: <code>{series._id}</code>
            </div>
            <div className="mb-3">
              Last Scan: <code>{series?.lastScan ? new Date(series.lastScan).toLocaleString() : 'Unknown'}</code>
            </div>
            <FloatingLabel controlId="seriesName" label="Series Name" className="mb-3">
              <Form.Control {...register('seriesName')} id="seriesName" placeholder="X-Men (2023)" />
            </FloatingLabel>
            <FloatingLabel controlId="description" label="Description" className="mb-3">
              <Form.Control as="textarea" {...register('description')} id="description" style={{ height: '160px' }} />
            </FloatingLabel>
            <Stack gap={2} direction="horizontal" className="align-items-center mb-2">
              <span>Credits</span>
              <Button variant="secondary" size="sm" type="button" onClick={() => appendCredit({ role: '', name: '', order: getNextOrder() })}>
                Add
              </Button>
            </Stack>
            {creditsFields.map((credits, index) => (
              <Row className="row g-2 align-items-center" key={credits.id}>
                <Col className="mb-3">
                  <FloatingLabel controlId={`name-${credits.id}`} label="Name" className="mb-3">
                    <Form.Control id={`name-${credits.id}`} {...register(`credits.${index}.name` as const)} autoComplete="off" />
                  </FloatingLabel>
                </Col>
                <Col className="mb-3">
                  <FloatingLabel controlId={`role-${credits.id}`} label="Role" className="mb-3">
                    <Form.Control id={`role-${credits.id}`} {...register(`credits.${index}.name` as const)} autoComplete="off" />
                  </FloatingLabel>
                </Col>
                <input type="hidden" {...register(`credits.${index}.order` as const)} />
                <Col xs={1} className="text-center" style={{ marginTop: '-20px' }}>
                  <Button variant="danger" type="button" size="sm" onClick={() => removeCredit(index)}>
                    <i className="bi bi-dash-circle"></i>
                  </Button>
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
        <Row>
          <Container>
            <h3>Services</h3>
            <Table striped hover responsive className="align-middle">
              <tbody>
                {services?.map((service) => {
                  return (
                    <tr key={service.serviceName}>
                      <td>
                        <Form.Check {...register(`services`)} id={`service${service._id}`} type="checkbox" value={service._id} />
                      </td>
                      <td>
                        <Form.Label className="form-check-label" htmlFor={`service${service._id}`}>
                          <ServiceImage service={service} size="xs" />
                        </Form.Label>
                      </td>
                      <td>
                        <Form.Label className="form-check-label" htmlFor={`service${service._id}`}>
                          <p className="card-title text-center">{service.serviceName}</p>
                        </Form.Label>
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
            </Table>
          </Container>
        </Row>
      </Form>
      <ToastContainer position="bottom-end" className="p-3">
        <Toast onClose={() => setShowSuccessToast(false)} show={showSuccessToast} autohide delay={3000} bg="primary">
          <Toast.Body>
            <Stack direction="horizontal" className="justify-content-between">
              <span>Successfully saved!</span>
              <Button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></Button>
            </Stack>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};
