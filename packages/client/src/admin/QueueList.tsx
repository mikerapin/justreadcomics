import { Button, ButtonGroup, Container, OverlayTrigger, Stack, Table, Tooltip } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { fetchQueueEntries } from '../data/queue';
import { IHydratedClientQueue } from '../types/queue';
import { Link, useNavigate } from 'react-router-dom';
import { hasBeenReviewed } from '../util/queueStatus';
import { ServiceImage } from '../components/ServiceImage';
import { QueueFilterStatus, QueueFilterType } from '@justreadcomics/common/dist/types/queue';

export const QueueList = () => {
  const navigate = useNavigate();
  const [queueList, setQueueList] = useState<IHydratedClientQueue[] | null>(null);
  const [filterStatus, setFilterStatus] = useState<QueueFilterStatus | undefined>();
  const [filterType, setFilterType] = useState<QueueFilterType | undefined>();

  useEffect(() => {
    fetchQueueEntries({ type: filterType, status: filterStatus }).then((res) => {
      setQueueList(res.data);
    });
  }, [filterType, filterStatus]);

  const getReviewStatus = (queue: IHydratedClientQueue) => {
    if (hasBeenReviewed(queue)) {
      switch (queue.reviewStatus) {
        case QueueFilterStatus.REJECTED:
          return <i className="bi bi-x-octagon text-danger"></i>;
        case QueueFilterStatus.ACCEPTED:
          return <i className="bi bi-check-all text-success"></i>;
        case QueueFilterStatus.PARTIAL:
          return <i className="bi bi-check2 text-warning"></i>;
      }
    }
    return <i className="bi bi-envelope text-primary-emphasis"></i>;
  };

  return (
    <Container>
      <h2 className="me-2">Queue</h2>

      <Stack direction="horizontal" gap={3}>
        <div>Filter</div>
        <ButtonGroup>
          <Button
            variant={filterStatus === undefined ? 'danger' : 'secondary'}
            onClick={() => setFilterStatus(undefined)}
          >
            All
          </Button>
          <Button
            variant={filterStatus === QueueFilterStatus.ACCEPTED ? 'danger' : 'secondary'}
            onClick={() => setFilterStatus(QueueFilterStatus.ACCEPTED)}
          >
            Accepted
          </Button>
          <Button
            variant={filterStatus === QueueFilterStatus.PARTIAL ? 'danger' : 'secondary'}
            onClick={() => setFilterStatus(QueueFilterStatus.PARTIAL)}
          >
            Partial
          </Button>
          <Button
            variant={filterStatus === QueueFilterStatus.REJECTED ? 'danger' : 'secondary'}
            onClick={() => setFilterStatus(QueueFilterStatus.REJECTED)}
          >
            Rejected
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant={filterType === undefined ? 'danger' : 'secondary'} onClick={() => setFilterType(undefined)}>
            All
          </Button>
          <Button
            variant={filterType === QueueFilterType.AUTO ? 'danger' : 'secondary'}
            onClick={() => setFilterType(QueueFilterType.AUTO)}
          >
            Automated
          </Button>
          <Button
            variant={filterType === QueueFilterType.USER ? 'danger' : 'secondary'}
            onClick={() => setFilterType(QueueFilterType.USER)}
          >
            User-Submitted
          </Button>
        </ButtonGroup>
      </Stack>

      <Table striped responsive hover>
        <thead>
          <tr>
            <th />
            <th style={{ textAlign: 'center' }}>Reviewed</th>
            <th style={{ textAlign: 'center' }}>ID</th>
            <th style={{ textAlign: 'center' }}>Type</th>
            <th style={{ textAlign: 'center' }}>Service</th>
            <th>Series</th>
            <th>Search Value</th>
            <th>Found Series</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '14px' }}>
          {queueList?.map((queue) => {
            return (
              <tr key={queue._id}>
                <td>
                  <Button size="sm" onClick={() => navigate(`/admin/queue/${queue._id}`)}>
                    View
                  </Button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="queue-status">
                        <code>{queue.reviewStatus}</code>
                      </Tooltip>
                    }
                  >
                    {getReviewStatus(queue)}
                  </OverlayTrigger>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="queue-id">
                        <code>{queue._id}</code>
                      </Tooltip>
                    }
                  >
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <i className="bi bi-link"></i>
                    </a>
                  </OverlayTrigger>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="queue-status">
                        {queue.reviewType === QueueFilterType.AUTO ? 'Scanner' : 'User-Submitted'}
                      </Tooltip>
                    }
                  >
                    {queue.reviewType === QueueFilterType.AUTO ? (
                      <i className="bi bi-upc-scan"></i>
                    ) : (
                      <i className="bi bi-person"></i>
                    )}
                  </OverlayTrigger>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <ServiceImage service={queue.service} size="xs" />
                </td>
                <td>
                  <Link to={`/admin/series/${queue.seriesId}`}>{queue.series.seriesName}</Link>
                </td>
                <td>{queue.searchValue}</td>
                <td>{queue.foundSeriesName}</td>
                <td>
                  <code>{queue.createdAt}</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};
