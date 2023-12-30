import React, { useState } from 'react';
import { Button, Stack, Toast, ToastContainer } from 'react-bootstrap';
import { Simulate } from 'react-dom/test-utils';
import error = Simulate.error;

export const useToast = (userSuccessMessage?: string, userErrorMessage?: string) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(userSuccessMessage);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(userErrorMessage);

  const showErrorToast = (msg?: string) => {
    setShowError(true);
    if (msg) {
      setErrorMessage(msg);
    }
  };
  const showSuccessToast = (msg?: string) => {
    setShowSuccess(true);
    if (msg) {
      setSuccessMessage(msg);
    }
  };
  const renderToast = () => (
    <ToastContainer position="bottom-end" className="p-3">
      <Toast onClose={() => setShowSuccess(false)} show={showSuccess} autohide delay={5000} bg="primary">
        <Toast.Header>
          <strong>Success!!</strong>
        </Toast.Header>
        <Toast.Body>
          <Stack direction="horizontal" className="justify-content-between">
            <div>
              <span>{successMessage}</span>
            </div>
          </Stack>
        </Toast.Body>
      </Toast>
      <Toast onClose={() => setShowError(false)} show={showError} autohide delay={3000} bg="secondary">
        <Toast.Header>
          <strong>There was an error!!</strong>
        </Toast.Header>
        <Toast.Body style={{ borderLeft: '2px solid red' }}>
          <Stack direction="horizontal" className="justify-content-between">
              <span style={{ fontFamily: 'monospace' }}>{errorMessage ? errorMessage : 'There was an error!'}</span>
          </Stack>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
  return { renderToast, showSuccessToast, showErrorToast };
};
