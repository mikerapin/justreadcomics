import { Button, Container, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { fetchQueueEntries } from '../data/queue';
import { IClientQueue, IHydratedClientQueue } from '../types/queue';
import { Link } from 'react-router-dom';

export const QueueList = () => {
  const [queue, setQueue] = useState<IHydratedClientQueue[] | null>(null);
  useEffect(() => {
    fetchQueueEntries().then((res) => {
      setQueue(res.data);
      console.log(res.data);
    });
  }, []);
  return (
    <Container>
      <h2 className="me-2">Queue</h2>

      <Table striped responsive hover>
        <thead>
          <tr>
            <th />
            <th>Queue ID</th>
            <th>Series</th>
            <th>Search Value</th>
            <th>Found Series</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {queue?.map((q) => {
            return (
              <tr key={q._id}>
                <td>
                  <Button size="sm">View</Button>
                </td>
                <td>
                  <small>
                    <code>{q._id}</code>
                  </small>
                </td>
                <td>
                  <Link to={`/admin/series/${q.seriesId}`}>{q.series.seriesName}</Link>
                </td>
                <td>{q.searchValue}</td>
                <td>{q.seriesName}</td>
                <td>
                  <code>{q.createdAt}</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};
