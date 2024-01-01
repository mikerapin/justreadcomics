import { Button, ButtonGroup, Container, OverlayTrigger, Stack, Table, Tooltip } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { fetchQueueEntries } from '../data/queue';
import { IHydratedClientQueue } from '../types/queue';
import { Link, useNavigate } from 'react-router-dom';
import { hasBeenReviewed } from '../util/queueStatus';
import { ServiceImage } from '../components/ServiceImage';
import { ReviewStatus } from '@justreadcomics/common/dist/types/queue';

export const QueueList = () => {
  const navigate = useNavigate();
  const [queueList, setQueueList] = useState<IHydratedClientQueue[] | null>(null);
  useEffect(() => {
    fetchQueueEntries().then((res) => {
      setQueueList(res.data);
    });
  }, []);

  const getReviewStatus = (queue: IHydratedClientQueue) => {
    if (hasBeenReviewed(queue)) {
      switch (queue.reviewStatus) {
        case 'rejected':
          return <i className="bi bi-x-octagon text-danger"></i>;
        case 'accepted':
          return <i className="bi bi-check-all text-success"></i>;
        case 'partial':
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
          <Button>All</Button>
          <Button>Needs Review</Button>
          <Button>Rejected</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button>Automated</Button>
          <Button>User-Submitted</Button>
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
                  <i className="bi bi-upc-scan"></i>
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
