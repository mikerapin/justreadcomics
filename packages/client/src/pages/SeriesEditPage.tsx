import React, { useCallback, useState } from 'react';
import { fetchSeriesById } from '../data/series';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IClientSeries, IClientSeriesService } from '../types/series';
import { IClientService } from '../types/service';
import { LoadingSeries } from './LoadingSeries';
import { SeriesImage } from '../components/SeriesImage';
import { Button, Col, Container, FloatingLabel, Form, Row, Stack, Table } from 'react-bootstrap';
import { useSubmitter } from '../hooks/submitter';
import { useFieldArray, useForm } from 'react-hook-form';
import { fetchAllServices } from '../data/services';
import { useToast } from '../admin/hooks/useToast';
import { Creator } from '@justreadcomics/common/dist/types/series';
import { ServiceImage } from '../components/ServiceImage';
import { fetchUserQueue, userSubmitQueueReview } from '../data/user-queue';
import { IClientUserQueueReviewData } from '../types/user-queue';

export interface IQueueForm {
  seriesName?: string;
  description?: string;
  seriesServices?: IClientSeriesService[];
  credits?: Creator[];
  imageUrl?: string;
  ongoingSeries?: boolean;
}

const sortServiesBySeriesServices = (services: IClientService[], seriesServices?: IClientSeriesService[]) => {
  if (!seriesServices) {
    return services;
  }
  return services.sort((a, b) => {
    const foundServiceA = seriesServices.findIndex((s) => s._id === a._id);
    const foundServiceB = seriesServices.findIndex((s) => s._id === b._id);
    if (foundServiceA > foundServiceB) {
      return -1;
    }
    if (foundServiceA === foundServiceB) {
      return 0;
    }
    return 1;
  });
};

export const SeriesEditPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSubmitter = useSubmitter();
  const { renderToast, showSuccessToast, showErrorToast } = useToast();

  const [series, setSeries] = useState<IClientSeries>();
  const [services, setServices] = useState<IClientService[]>();
  const [userQueue, setUserQueue] = useState<IClientUserQueueReviewData>();
  const [submitEnabled, setSubmitEnabled] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { isDirty }
  } = useForm<IQueueForm>({
    defaultValues: async () => {
      if (id) {
        return Promise.all([fetchSeriesById(id), fetchAllServices(), fetchUserQueue(id, searchParams.get('qid'))]).then(
          (result) => {
            const [fetchedSeries, fetchedServices, fetchedQueue] = result;
            setUserQueue(fetchedQueue.data);
            setSeries(fetchedSeries.series);
            setServices(sortServiesBySeriesServices(fetchedServices.data, fetchedSeries.series.services));

            if (fetchedQueue.data) {
              const {
                seriesName,
                credits,
                seriesDescription,
                services: seriesServices,
                imageUrl,
                ongoingSeries
              } = fetchedQueue.data;
              return { seriesName, credits, seriesServices, description: seriesDescription, imageUrl, ongoingSeries };
            }

            // fallback to the series if we're not editing a queue
            const { seriesName, credits, description, services: seriesServices, ongoingSeries } = fetchedSeries.series;
            return { seriesName, credits, seriesServices, description, ongoingSeries };
          }
        );
      }
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

  const getSeriesServiceIndexById = useCallback(
    (serviceId?: string) => {
      return series?.services?.findIndex((service) => service._id === serviceId);
    },
    [series]
  );

  if (!id) {
    navigate('/');
  }

  if (!series) {
    return <LoadingSeries />;
  }

  const saveSeries = handleSubmit((seriesForm) => {
    setSubmitEnabled(false);
    seriesForm.credits = seriesForm.credits?.filter((c) => c.name !== '' && c.role !== '');
    seriesForm.seriesServices = seriesForm.seriesServices?.filter((s) => s._id);
    const { seriesName, seriesServices, description, credits, imageUrl } = seriesForm;

    if (id) {
      const queueSubmission: Partial<IClientUserQueueReviewData> = {
        seriesId: id,
        seriesName,
        seriesDescription: description,
        imageUrl,
        credits,
        services: seriesServices
      };
      userSubmitQueueReview(queueSubmission, userQueue?._id)
        .then((res) => {
          if (res.error) {
            showErrorToast(res.msg);
          } else {
            showSuccessToast(res.msg);
          }
        })
        .catch(() => {
          showErrorToast('There was an error with your submission. Please try again later.');
        })
        .finally(() => {
          setTimeout(() => {
            navigate(-1);
          }, 5000);
        });
      setTimeout(() => {
        setSubmitEnabled(true);
      }, 5000);
    }
  });

  const getNextOrder = () => {
    const currentCredits = getValues().credits;
    if (currentCredits) {
      return currentCredits.length;
    }
    return 2;
  };

  return (
    <Container className="container">
      <Form onSubmit={saveSeries}>
        <Stack direction="horizontal" className="justify-content-between align-items-center">
          <h3 className="mt-3 mb-3">Editing {series?.seriesName}</h3>
          <Stack direction="horizontal">
            <Button variant="secondary" type="button" className="mx-1" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={!isDirty && submitEnabled}>
              Save
            </Button>
          </Stack>
        </Stack>
        <Row className="row">
          <Col xs={4} className="mb-3">
            {/* add click to view in modal \/\/\/ */}
            <SeriesImage series={series} alt={series.seriesName} />
          </Col>
          <Col>
            <div className="mb-3">
              <Link to={`/series/${series._id}`}>Public Page</Link>
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
                {services?.map((service, index) => {
                  const currentSeriesService = getSeriesServiceById(service._id);
                  const tempIndex = getSeriesServiceIndexById(service._id) || -1;
                  const currentSeriesServiceIndex = tempIndex > -1 ? tempIndex : index;
                  return (
                    <tr key={service.serviceName}>
                      <td>
                        <Form.Check
                          type="switch"
                          {...register(`seriesServices.${currentSeriesServiceIndex}._id`)}
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
                      <td>
                        {currentSeriesService?.seriesServiceUrl && (
                          <a href={currentSeriesService?.seriesServiceUrl} target="_blank" rel="nofollow noreferrer">
                            Open
                          </a>
                        )}
                      </td>
                      <td>
                        <Form.FloatingLabel label="Series Page URL">
                          <Form.Control
                            type="text"
                            {...register(`seriesServices.${currentSeriesServiceIndex}.seriesServiceUrl`)}
                            value={currentSeriesService?.seriesServiceUrl}
                          />
                        </Form.FloatingLabel>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Container>
        </Row>
      </Form>
      {renderToast()}
    </Container>
  );
};
