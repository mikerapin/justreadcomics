import { Link, useParams } from 'react-router-dom';
import React, { useCallback, useRef, useState } from 'react';
import { IClientSeries, IClientSeriesService, IHydratedSeries, ISeriesWithImageUpload } from '../types/series';
import { createSeries, fetchSeriesById, updateSeriesById } from '../data/series';
import { useFieldArray, useForm } from 'react-hook-form';
import { fetchAllServices } from '../data/services';
import { IClientService, IClientServiceAndSeriesService } from '../types/service';
import { ImageUploader } from './subcomponents/ImageUploader';
import { ISeriesForm } from './types/series';
import { SeriesImage } from '../components/SeriesImage';
import { Scanner } from './series-service/Scanner';
import { Button, ButtonGroup, Col, Container, FloatingLabel, Form, Row, Stack, Table } from 'react-bootstrap';
import { ServiceImage } from '../components/ServiceImage';
import { IScannerResult } from '../data/scanner';
import { useToast } from './hooks/useToast';
import { EditSeriesServiceModal } from './series-service/EditSeriesServiceModal';

const getSeriesServiceStringArray = (seriesServices?: IClientSeriesService[]) => {
  return (
    seriesServices?.map((service) => {
      return service._id;
    }) || []
  );
};

export const AdminSeriesEdit = () => {
  const { id } = useParams();
  const { renderToast, showSuccessToast, showErrorToast } = useToast();

  const [series, setSeries] = useState<IClientSeries>();
  const [services, setServices] = useState<IClientService[]>();
  const [editSeriesService, setEditSeriesService] = useState<IClientServiceAndSeriesService | null>(null);

  const rightColumnRef = useRef<HTMLDivElement>(null);

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

  const showErrorToastCall = (msg: string) => {
    showErrorToast(msg);
  };

  if (!series) {
    return <span>'Loading'</span>;
  }

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

    let promise: Promise<IHydratedSeries>;
    let successMessage: string;
    if (id) {
      promise = updateSeriesById(updatedSeries);
      successMessage = `Success updating ${updatedSeries.seriesName}!`;
    } else {
      promise = createSeries(updatedSeries);
      successMessage = `Success creating ${updatedSeries.seriesName}!`;
    }
    promise.then((res) => {
      setSeries(res.series);
      setValue('services', getSeriesServiceStringArray(res.series.services));
      showSuccessToast(successMessage);
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

  const scannerCallback = (result: IScannerResult) => {
    if (!result.series && result.msg) {
      showErrorToast(result.msg);
    } else {
      setSeries(result.series);
      setValue('description', result.series.description);
      setValue('credits', result.series.credits);
      showSuccessToast('Scan complete!');
    }
  };

  const openEditSeriesServiceModal = (serviceId: string) => {
    const serviceLookup = services?.find((service) => service._id === serviceId);
    const seriesServiceLookup = getSeriesServiceById(serviceId);
    if (serviceLookup && seriesServiceLookup) {
      setEditSeriesService({
        service: serviceLookup,
        seriesService: seriesServiceLookup
      });
    }
  };

  const handleCloseEditSeriesServiceModal = (updatedSeries?: IClientSeries) => {
    if (updatedSeries) {
      setSeries(updatedSeries);
    }
    setEditSeriesService(null);
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
            <FloatingLabel label="Series Name" className="mb-3">
              <Form.Control {...register('seriesName')} id="seriesName" placeholder="X-Men (2023)" />
            </FloatingLabel>
            <FloatingLabel label="Description" className="mb-3">
              <Form.Control as="textarea" {...register('description')} id="description" style={{ height: '160px' }} />
            </FloatingLabel>
            <Stack gap={2} direction="horizontal" className="align-items-center mb-2">
              <span>Credits</span>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => appendCredit({ role: '', name: '', order: getNextOrder() })}
              >
                Add
              </Button>
            </Stack>
            {creditsFields.map((credits, index) => (
              <Row className="row g-2 align-items-center" key={credits.id}>
                <Col className="mb-3">
                  <FloatingLabel label="Name" className="mb-3">
                    <Form.Control
                      id={`name-${credits.id}`}
                      {...register(`credits.${index}.name` as const)}
                      autoComplete="off"
                    />
                  </FloatingLabel>
                </Col>
                <Col className="mb-3">
                  <FloatingLabel label="Role" className="mb-3">
                    <Form.Control
                      id={`role-${credits.id}`}
                      {...register(`credits.${index}.role` as const)}
                      autoComplete="off"
                    />
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
                  const currentSeriesService = getSeriesServiceById(service._id);
                  return (
                    <tr key={service.serviceName}>
                      <td>
                        <Form.Check
                          type="switch"
                          {...register(`services`)}
                          id={`service${service._id}`}
                          value={service._id}
                        />
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
                        Last Scan: <code>{currentSeriesService?.lastScan}</code>
                      </td>
                      <td>
                        <ButtonGroup>
                          <Button
                            variant="secondary"
                            onClick={() => (service._id ? openEditSeriesServiceModal(service._id) : null)}
                          >
                            Edit
                          </Button>
                          <Scanner
                            seriesService={currentSeriesService}
                            seriesId={series._id}
                            scannerResultCallback={scannerCallback}
                            showErrorToastCall={showErrorToastCall}
                          />
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Container>
        </Row>
      </Form>
      <EditSeriesServiceModal
        seriesService={editSeriesService}
        series={series}
        showModal={editSeriesService !== null}
        handleClose={handleCloseEditSeriesServiceModal}
      />
      {renderToast()}
    </Container>
  );
};
