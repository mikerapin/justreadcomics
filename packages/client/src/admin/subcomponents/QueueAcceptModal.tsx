import { Badge, Button, Container, Modal, Stack } from 'react-bootstrap';
import { IHydratedClientQueue, QueueViewForm } from '../../types/queue';
import { Link } from 'react-router-dom';
import { getSeriesImage } from '../../util/image';
import { CORPO_SERVICE_ID, CU_SERVICE_ID } from '@justreadcomics/common/dist/const';
import React from 'react';
import classNames from 'classnames';

interface QueueAcceptModalProps {
  showModal: boolean;
  handleClose: () => void;
  overrideChanges: QueueViewForm;
  queue: IHydratedClientQueue;
}

export const QueueAcceptModal = ({ showModal, handleClose, overrideChanges, queue }: QueueAcceptModalProps) => {
  const seriesName = overrideChanges.overwriteSeriesName ? queue.foundSeriesName : queue.series.seriesName;
  const seriesDescription = overrideChanges.overwriteSeriesDescription
    ? queue.seriesDescription
    : queue.series.description;
  const credits = overrideChanges.overwriteSeriesCredits ? queue.credits : queue.series.credits;
  const seriesImage = overrideChanges.overwriteSeriesImage ? queue.imageUrl : getSeriesImage(queue.series);
  const withinCU = overrideChanges.overwriteSeriesWithinCU
    ? queue.withinCU
    : queue.series.services?.includes({ _id: CU_SERVICE_ID });

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          By clicking <strong>Save</strong> you will make the following change(s) to the series:
          <br />
          <Link
            title={`Open ${queue.series.seriesName} in a new tab`}
            to={`/admin/series/${queue.series._id}`}
            target="_blank"
            rel="noreferrer nofollow"
          >
            <strong>{queue.series.seriesName}</strong>
          </Link>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <h4>Updated Series information:</h4>
          <div>
            <strong>Series Name:</strong>{' '}
            {overrideChanges.overwriteSeriesName ? <Badge bg="danger">Will Change!</Badge> : null}
            <br />
            {seriesName}
          </div>
          <hr />
          <div>
            <strong>Series Description:</strong>{' '}
            {overrideChanges.overwriteSeriesDescription ? <Badge bg="danger">Will Change!</Badge> : null}
            <br />
            {seriesDescription ? seriesDescription : <code>NONE</code>}
          </div>
          <hr />
          <Stack>
            <Stack direction="horizontal" gap={5} className="align-middle'">
              <div>
                <strong>Image:</strong>{' '}
                {overrideChanges.overwriteSeriesImage ? <Badge bg="danger">Will Change!</Badge> : null}
              </div>
              <img
                alt={queue.series.seriesName}
                src={seriesImage}
                className={`img-fluid img-thumbnail`}
                style={{ width: '150px' }}
              />
            </Stack>
          </Stack>
          {queue.serviceId === CORPO_SERVICE_ID ? (
            <>
              <hr />
              <div>
                {overrideChanges.overwriteSeriesWithinCU ? <Badge bg="danger">Will Change!</Badge> : null}{' '}
                <strong>Within CU?</strong>:<br />
                {withinCU ? <code>true</code> : <code>false</code>}
              </div>
            </>
          ) : null}
          {credits?.length ? (
            <>
              <hr />
              <div>
                {overrideChanges.overwriteSeriesCredits ? <Badge bg="danger">Will Change!</Badge> : null}{' '}
                <strong>Creator(s):</strong>
                <ul>
                  {credits.map((credit) => (
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={() => console.log('submit the queue changes')}>
          Understood
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
