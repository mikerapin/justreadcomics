import React, { useEffect, useState } from 'react';
import { Button, Container, OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { IClientUserQueueReviewData, IClientUserSubmissionListData } from '../types/user-queue';
import { getReviewStatus } from '../util/getReviewStatus';
import { fetchAllUserSubmissions } from '../data/user-queue';
import { Link } from 'react-router-dom';

export const UserSubmissionsList = () => {
  const [submissionsList, setSubmissionsList] = useState<IClientUserSubmissionListData[] | null>(null);

  useEffect(() => {
    fetchAllUserSubmissions().then((res) => {
      console.log(res.data);
      setSubmissionsList(res.data);
    });
  }, []);

  return (
    <Container>
      <h2 className="me-2">User Submissions</h2>

      <Table striped responsive hover>
        <thead>
          <tr>
            <th />
            <th style={{ textAlign: 'center' }}>Reviewed</th>
            <th style={{ textAlign: 'center' }}>ID</th>
            <th style={{ textAlign: 'center' }}>User</th>
            <th>Series</th>
            <th>Date Submitted</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '14px' }}>
          {submissionsList?.map((submission) => {
            return (
              <tr key={submission._id}>
                <td>
                  <Button>View</Button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="queue-status">
                        <code>{submission.reviewStatus}</code>
                      </Tooltip>
                    }
                  >
                    {getReviewStatus(submission)}
                  </OverlayTrigger>
                </td>
                <td>
                  <code>{submission._id}</code>
                </td>
                <td>
                  <code>{submission.userId}</code>
                </td>
                <td>
                  <Link to={`/admin/series/${submission.seriesId}`}>{submission.series.seriesName}</Link>
                </td>
                <td>
                  <code>{submission.createdAt}</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};
