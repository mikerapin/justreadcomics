import { Button, Modal } from 'react-bootstrap';
import React from 'react';
import { QueueModalProps } from '../../types/queue';
import { rejectQueueReview } from '../../data/queue';

export const QueueRejectChangesModal = ({ showModal, handleClose, queue }: QueueModalProps) => {
  const submitChanges = () => {
    rejectQueueReview(queue._id).then((res) => {
      handleClose({ updatedQueue: res.queue, msg: res.msg, error: res.error });
    });
  };

  return (
    <Modal show={showModal} onHide={() => handleClose()} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          By clicking <strong>Accept</strong> you will reject all changes of the queue
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>Sound good?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleClose()}>
          Close
        </Button>
        <Button variant="primary" onClick={submitChanges}>
          Accept
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
