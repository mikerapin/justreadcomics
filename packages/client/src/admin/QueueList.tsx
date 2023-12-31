import { Button, Container, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { fetchQueueEntries } from '../data/queue';
import { IHydratedClientQueue } from '../types/queue';
import { Link, useNavigate } from 'react-router-dom';
import { hasBeenReviewed } from '../util/queueStatus';
import {ServiceImage} from "../components/ServiceImage";

export const QueueList = () => {
  const navigate = useNavigate();
  const [queueList, setQueueList] = useState<IHydratedClientQueue[] | null>(null);
  useEffect(() => {
    fetchQueueEntries().then((res) => {
      setQueueList(res.data);
    });
  }, []);
  return (
    <Container>
      <h2 className="me-2">Queue</h2>

      <Table striped responsive hover>
        <thead>
          <tr>
            <th />
            <th style={{textAlign: 'center'}}>Reviewed</th>
            <th>Queue ID</th>
            <th>Service</th>
            <th>Series</th>
            <th>Search Value</th>
            <th>Found Series</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody style={{fontSize: '14px'}}>
          {queueList?.map((queue) => {
            return (
              <tr key={queue._id}>
                <td>
                  <Button size="sm" onClick={() => navigate(`/admin/queue/${queue._id}`)}>
                    View
                  </Button>
                </td>
                <td style={{textAlign: 'center'}}>{hasBeenReviewed(queue) ? <code>{queue.reviewStatus}</code> : 'No'}</td>
                <td>
                  <small>
                    <code>{queue._id}</code>
                  </small>
                </td>
                <td>
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
