import { Button, ButtonGroup, Col, Container, Form, Row, Stack } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { fetchSingleQueueEntry } from '../data/queue';
import { IHydratedClientQueue, QueueViewForm } from '../types/queue';
import { getSeriesImage } from '../util/image';
import { CORPO_SERVICE_ID, CU_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { hasBeenReviewed } from '../util/queueStatus';
import { useForm } from 'react-hook-form';
import { QueueAcceptModal } from './subcomponents/QueueAcceptModal';

const defaultQueueOverrides: QueueViewForm = {
  overwriteSeriesName: false,
  overwriteSeriesDescription: false,
  overwriteSeriesImage: false,
  overwriteSeriesCredits: false,
  overwriteSeriesWithinCU: false
};

export const QueueView = () => {
  const { id } = useParams();
  const [queue, setQueue] = useState<IHydratedClientQueue | null>(null);

  const [disableBigChangeButtons, setDisableBigChangeButtons] = useState(true);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [overrideChanges, setOverrideChanges] = useState<QueueViewForm>(defaultQueueOverrides);

  useEffect(() => {
    if (id) {
      fetchSingleQueueEntry(id).then((res) => {
        setQueue(res.data);
      });
    }
    setTimeout(() => {
      setDisableBigChangeButtons(false);
    }, 5000);
  }, [id]);

  const {
    register,
    handleSubmit,
    formState: { isDirty }
  } = useForm<QueueViewForm>({
    defaultValues: defaultQueueOverrides
  });

  if (!queue) {
    return <Container>Loading...</Container>;
  }

  const handleCloseChangesModal = (msg?: string) => {
    setShowChangesModal(false);
    if (msg) {
      // show toast and reload the content
    }
  };

  const handleSaveOverrides = handleSubmit((queueForm) => {
    setOverrideChanges(queueForm);
    setShowChangesModal(true);
  });

  return (
    <Container>
      <Stack direction="horizontal" className="justify-content-between">
        <h2 className="me-2">
          Queue <code>{id}</code>
        </h2>
        <ButtonGroup>
          <Button variant="danger" disabled={hasBeenReviewed(queue) || disableBigChangeButtons}>
            Reject All
          </Button>
          <Button variant="secondary" disabled={hasBeenReviewed(queue) || disableBigChangeButtons}>
            Accept All
          </Button>
          <Button variant="primary" onClick={handleSaveOverrides} disabled={!isDirty || hasBeenReviewed(queue)}>
            Accept Selected
          </Button>
        </ButtonGroup>
      </Stack>
      <hr />
      <Row>
        <Col xs={6}>
          <h3>
            Search Query: <code>{queue.searchValue}</code>
          </h3>
          <hr />
          <Container>
            <div>
              <a href={queue.seriesPageUrl} target="_blank" rel="noreferrer nofollow">
                Found series page
              </a>
            </div>
            <hr />
            <div>
              <Form.Check
                type="checkbox"
                {...register('overwriteSeriesName')}
                inline
                id="overwrite-seriesName"
                label={
                  <>
                    <strong>Series Name:</strong>
                    <br />
                    {queue.foundSeriesName}
                  </>
                }
              />
            </div>
            <hr />
            <div>
              <Form.Check
                type="checkbox"
                {...register('overwriteSeriesDescription')}
                inline
                id="overwrite-seriesDescription"
                label={
                  <>
                    <strong>Series Description:</strong>
                    <br />
                    {queue.seriesDescription ? queue.seriesDescription : <code>NONE</code>}
                  </>
                }
              />
            </div>
            <hr />
            <Stack>
              <Form.Check
                type="checkbox"
                {...register('overwriteSeriesImage')}
                inline
                id="overwrite-seriesImage"
                label={
                  <Stack direction="horizontal" gap={5} className={'align-middle'}>
                    <div>
                      <strong>Image:</strong>
                    </div>
                    <img
                      src={getSeriesImage()}
                      alt={queue.foundSeriesName}
                      className={`img-fluid img-thumbnail`}
                      style={{ width: '150px' }}
                    />
                  </Stack>
                }
              />
            </Stack>
            <hr />
            {queue.serviceId === CORPO_SERVICE_ID ? (
              <>
                <div>
                  <Form.Check
                    type="checkbox"
                    {...register('overwriteSeriesWithinCU')}
                    inline
                    id="overwrite-withinCU"
                    label={
                      <>
                        <strong>Within CU?</strong>:
                        <br />
                        {queue.withinCU ? <code>true</code> : <code>false</code>}
                      </>
                    }
                  />
                </div>
                <hr />
              </>
            ) : null}
            {queue.credits?.length ? (
              <div>
                <Form.Check
                  type="checkbox"
                  {...register('overwriteSeriesCredits')}
                  inline
                  id="overwrite-credits"
                  label={
                    <>
                      <strong>Creator(s):</strong>
                      <ul>
                        {queue.credits.map((credit) => (
                          <li key={credit.name}>
                            {credit.role ? `${credit.role}: ` : ''}
                            {credit.name}
                          </li>
                        ))}
                      </ul>
                    </>
                  }
                />
              </div>
            ) : null}
          </Container>
        </Col>
        <Col xs={6}>
          <h3>Series Data</h3>
          <hr />
          <Container>
            <div>
              <Link to={`/admin/series/${queue.series._id}`} target="_blank" rel="noreferrer nofollow">
                View Series Admin Page
              </Link>
            </div>
            <hr />
            <div>
              <strong>Series Name:</strong>
              <br />
              {queue.series.seriesName}
            </div>
            <hr />
            <div>
              <strong>Series Description:</strong>
              <br />
              {queue.series.description ? queue.series.description : <code>N/A</code>}
            </div>
            <hr />
            <Stack>
              <Stack direction="horizontal" gap={5} className={'align-middle '}>
                <div>
                  <strong>Image:</strong>
                </div>
                <img
                  alt={queue.series.seriesName}
                  src={getSeriesImage(queue.series)}
                  className={`img-fluid img-thumbnail`}
                  style={{ width: '150px' }}
                />
              </Stack>
            </Stack>
            {queue.serviceId === CORPO_SERVICE_ID ? (
              <>
                <hr />
                <div>
                  <strong>Within CU?</strong>:
                  <br />
                  {queue.series.services?.includes({ _id: CU_SERVICE_ID }) ? <code>true</code> : <code>false</code>}
                </div>
              </>
            ) : null}
            {queue.series.credits?.length ? (
              <>
                <hr />
                <div>
                  <strong>Creator(s):</strong>
                  <ul>
                    {queue.series.credits.map((credit) => (
                      <li key={credit.name}>
                        {credit.role ? `${credit.role}: ` : ''}
                        {credit.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </Container>
        </Col>
      </Row>
      <QueueAcceptModal
        overrideChanges={overrideChanges}
        showModal={showChangesModal}
        handleClose={handleCloseChangesModal}
        queue={queue}
      />
    </Container>
  );
};
