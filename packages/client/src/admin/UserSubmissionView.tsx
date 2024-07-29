import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  OverlayTrigger,
  Placeholder,
  Row,
  Stack,
  Table,
  Tooltip
} from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchSingleUserSubmission } from '../data/user-queue';
import { useToast } from './hooks/useToast';
import { IClientUserSubmissionListData } from '../types/user-queue';
import { hasBeenReviewed } from '../util/queueStatus';
import isEqual from 'lodash/isEqual';
import { ServiceImage } from '../components/ServiceImage';
import { IClientService } from '../types/service';

export const UserSubmissionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { renderToast, showErrorToast, showSuccessToast } = useToast();
  const [submission, setSubmission] = useState<IClientUserSubmissionListData | null>(null);
  const [disableBigChangeButtons, setDisableBigChangeButtons] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSingleUserSubmission(id)
        .then((res) => {
          setSubmission(res.data);
        })
        .catch(() => {
          showErrorToast('There was an error loading the queue');
        });
    }
    setTimeout(() => {
      setDisableBigChangeButtons(false);
    }, 5000);
  }, []);

  if (!id) {
    navigate('/admin/user-submissions');
  }

  const getSubmissionSeriesServiceById = useCallback(
    (serviceId?: string) => {
      return submission?.services?.find((service) => service._id === serviceId);
    },
    [submission]
  );

  if (!submission) {
    return (
      <Container>
        <Placeholder animation="glow">
          <Placeholder xs={8} size="sm" style={{ height: '48px' }} />
        </Placeholder>
      </Container>
    );
  }
  const reviewed = hasBeenReviewed(submission);
  const isDirty = false;

  const series = submission.series;
  const seriesNameChange = submission.seriesName !== series.seriesName;
  const seriesDescriptionChange = submission.seriesDescription !== series.description;
  const seriesCreditsChange = !isEqual(submission.credits, series.credits);

  const getServiceSeriesPageUrl = (service: IClientService) => {
    const submissionSeriesService = getSubmissionSeriesServiceById(service._id);
    if (submissionSeriesService && submissionSeriesService.seriesServiceUrl) {
      return (
        <a target="_blank" rel="nofollow noreferrer" href={submissionSeriesService.seriesServiceUrl}>
          Series Page
        </a>
      );
    }
    return <></>;
  };

  return (
    <Container>
      <Button onClick={() => navigate(-1)}>Back</Button>
      <Stack direction="horizontal" className="justify-content-between">
        <h2 className="me-2">
          User Submission: <code>{submission._id}</code>
        </h2>

        {submission.reviewedDate ? (
          <>
            <div>
              <h4>Review Date</h4>
              <code>{submission.reviewedDate}</code>
            </div>
            <div>
              <h4>Review Status: </h4>
              <code>{submission.reviewStatus}</code>
            </div>
          </>
        ) : (
          <ButtonGroup>
            <Button
              variant="danger"
              onClick={() => console.log('REJECT')}
              disabled={reviewed || disableBigChangeButtons}
            >
              Reject All
            </Button>
            <Button variant="secondary" disabled={reviewed || disableBigChangeButtons}>
              Accept All
            </Button>
            <Button variant="primary" onClick={() => console.log('ACCEPT')} disabled={!isDirty || reviewed}>
              Accept Selected
            </Button>
          </ButtonGroup>
        )}
      </Stack>
      <Row className="pb-3">
        <div className="mb-3">
          <Link to={`/series/${series._id}`}>Public Page</Link>
        </div>
      </Row>
      <Alert variant="success">
        Changes to the series are highlighted in green. Hover over changed series details to see original.
      </Alert>
      <hr />
      <Row className="pb-3">
        <Col>
          <div>
            <strong>Series Name: </strong>
            {seriesNameChange ? (
              <OverlayTrigger overlay={<Tooltip>{series.seriesName}</Tooltip>}>
                <span style={{ color: seriesNameChange ? 'green' : '' }}>{submission.seriesName}</span>
              </OverlayTrigger>
            ) : (
              <span>{submission.seriesName}</span>
            )}
          </div>
        </Col>
      </Row>
      <Row className="pb-3">
        <Col>
          <div>
            <div>
              <strong>Series Description: </strong>
            </div>
            {seriesDescriptionChange ? (
              <OverlayTrigger
                overlay={<Tooltip>{series.description?.length ? series.description : <code>N/A</code>}</Tooltip>}
              >
                <span style={{ color: seriesDescriptionChange ? 'green' : '' }}>
                  {submission.seriesDescription?.length ? submission.seriesDescription : <code>N/A</code>}
                </span>
              </OverlayTrigger>
            ) : (
              <span>{submission.seriesDescription?.length ? submission.seriesDescription : <code>N/A</code>}</span>
            )}
          </div>
        </Col>
      </Row>
      <Row className="pb-3">
        <Col>
          <div>
            <div>
              <strong>Credits: </strong>
            </div>
            {seriesCreditsChange ? (
              <OverlayTrigger
                overlay={
                  <Tooltip>
                    {series.credits?.length ? (
                      series.credits.map((credit, index) => (
                        <Badge key={`${credit.name}-${index}`} pill bg="secondary">
                          {credit.name}
                        </Badge>
                      ))
                    ) : (
                      <code>N/A</code>
                    )}
                  </Tooltip>
                }
              >
                <span>
                  {submission.credits?.length ? (
                    submission.credits.map((credit, index) => (
                      <Badge key={`${credit.name}-${index}`} pill bg="success">
                        {credit.name}
                      </Badge>
                    ))
                  ) : (
                    <code>N/A</code>
                  )}
                </span>
              </OverlayTrigger>
            ) : (
              <span>
                {submission.credits?.length ? (
                  submission.credits.map((credit, index) => (
                    <Badge key={`${credit.name}-${index}`} pill bg="secondary">
                      {credit.name}
                    </Badge>
                  ))
                ) : (
                  <code>none listed</code>
                )}
              </span>
            )}
          </div>
        </Col>
      </Row>
      <Row className="pb-3">
        <Col>
          <div>
            <strong>Services</strong>
            <Table striped hover responsive className="align-middle">
              <tbody>
                {submission.newServices?.map((service) => {
                  let isNewSeriesService = true;
                  let currentSeriesService;

                  let isUpdatedSeriesServiceUrl = false;
                  if (series.services) {
                    isNewSeriesService = !Boolean(submission.currentServices.find((s) => s._id === service._id));
                  }
                  if (!isNewSeriesService) {
                    currentSeriesService = series.services?.find((s) => s._id === service._id);
                    isUpdatedSeriesServiceUrl =
                      currentSeriesService?.seriesServiceUrl !==
                      getSubmissionSeriesServiceById(service._id)?.seriesServiceUrl;
                  }

                  console.log(currentSeriesService);

                  return (
                    <tr key={service.serviceName}>
                      <td style={{ backgroundColor: isNewSeriesService ? 'green' : '' }}>
                        <Form.Label className="form-check-label" htmlFor={`service${service._id}`}>
                          <ServiceImage service={service} size="xs" />
                        </Form.Label>
                      </td>
                      <td style={{ backgroundColor: isNewSeriesService ? 'green' : '' }}>
                        <Form.Label className="form-check-label" htmlFor={`service${service._id}`}>
                          <p className="card-title text-center">{service.serviceName}</p>
                        </Form.Label>
                      </td>
                      <td style={{ backgroundColor: isNewSeriesService || isUpdatedSeriesServiceUrl ? 'green' : '' }}>
                        <Stack>
                          {getServiceSeriesPageUrl(service)}
                          {isUpdatedSeriesServiceUrl ? (
                            <a target="_blank" rel="nofollow noreferrer" href={currentSeriesService?.seriesServiceUrl}>
                              {currentSeriesService?.seriesServiceUrl ? 'Current Series Page' : <code>N/A</code>}
                            </a>
                          ) : (
                            ''
                          )}
                        </Stack>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
      {renderToast()}
    </Container>
  );
};
