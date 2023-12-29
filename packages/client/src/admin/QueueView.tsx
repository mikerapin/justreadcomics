import { Button, ButtonGroup, Col, Container, Row, Stack } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { fetchSingleQueueEntry } from '../data/queue';
import { IHydratedClientQueue } from '../types/queue';
import { getSeriesImage } from '../util/image';
import { CORPO_SERVICE_ID } from '@justreadcomics/common/dist/const';

export const QueueView = () => {
  const { id } = useParams();
  const [queue, setQueue] = useState<IHydratedClientQueue | null>(null);

  const [disableBigChangeButtons, setDisableBigChangeButtons] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSingleQueueEntry(id).then((res) => {
        setQueue(res.data);
        console.log(res.data);
      });
    }
    setTimeout(() => {
      setDisableBigChangeButtons(false);
    }, 3000);
  }, []);

  if (!queue) {
    return <Container>Loading...</Container>;
  }
  return (
    <Container>
      <Stack direction="horizontal" className="justify-content-between">
        <h2 className="me-2">
          Queue <code>{id}</code>
        </h2>
        <ButtonGroup>
          <Button variant="danger" disabled={disableBigChangeButtons}>
            Reject All
          </Button>
          <Button variant="secondary" disabled={disableBigChangeButtons}>
            Accept All
          </Button>
          <Button variant="primary">Accept Selected</Button>
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
              <strong>Series Name:</strong> {queue.foundSeriesName}
            </div>
            <hr />
            <div>
              <strong>Series Description:</strong>{' '}
              {queue.seriesDescription ? queue.seriesDescription : <code>N/A</code>}
            </div>
            <hr />
            <Stack>
              <Stack direction="horizontal" gap={5} className={'align-middle '}>
                <div>
                  <strong>Image:</strong>
                </div>
                <img src={getSeriesImage()} className={`img-fluid img-thumbnail`} style={{ width: '150px' }} />
              </Stack>
            </Stack>
            <hr />
            {queue.serviceId === CORPO_SERVICE_ID ? (
              <>
                <div>
                  <strong>Within CU?</strong>: {queue.withinCU ? 'true' : 'false'}
                </div>
                <hr />
              </>
            ) : null}
            {queue.credits?.length ? (
              <div>
                <strong>Creators:</strong>
                <ul>
                  {queue.credits.map((credit) => (
                    <li key={credit.name}>
                      {credit.name}
                      {credit.role ? ` ${credit.role}` : ''}
                    </li>
                  ))}
                </ul>
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
              <strong>Series Name:</strong> {queue.series.seriesName}
            </div>
            <hr />
            <div>
              <strong>Series Description:</strong>{' '}
              {queue.series.description ? queue.series.description : <code>N/A</code>}
            </div>
            <hr />
            <Stack>
              <Stack direction="horizontal" gap={5} className={'align-middle '}>
                <div>
                  <strong>Image:</strong>
                </div>
                <img
                  src={getSeriesImage(queue.series)}
                  className={`img-fluid img-thumbnail`}
                  style={{ width: '150px' }}
                />
              </Stack>
            </Stack>
            <hr />
            {queue.serviceId === CORPO_SERVICE_ID ? (
              <>
                <div>
                  <strong>Within CU?</strong>:{' '}
                  {queue.series.services?.includes({ _id: CORPO_SERVICE_ID }) ? 'true' : 'false'}
                </div>
                <hr />
              </>
            ) : null}
            {queue.series.credits?.length ? (
              <div>
                <strong>Creators:</strong>
                <ul>
                  {queue.series.credits.map((credit) => (
                    <li key={credit.name}>
                      {credit.name}
                      {credit.role ? ` ${credit.role}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};
