import React, { ChangeEvent, useEffect, useState } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Col, Stack, Form } from 'react-bootstrap';

export const ImageUploader = ({ register, fieldName }: { register: UseFormRegister<any>; fieldName: string }) => {
  const [preview, setPreview] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File>();

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    // I've kept this example simple by using the first image instead of multiple
    setSelectedFile(e.target.files[0]);
  };

  return (
    <Stack className="mt-2">
      <Col className="col mb-1">
        <label htmlFor="image">Upload new Image</label>
      </Col>
      <Col className="col">
        <Form.Control
          {...register(fieldName)}
          type="file"
          id="image"
          className="form-control"
          onChange={onSelectFile}
          accept="image/png, image/gif, image/jpeg, image/jpg"
        />

        {selectedFile && (
          <Stack className="align-items-center">
            <Col xs={6}>Preview:</Col>
            <Col xs={6}>
              <img src={preview} className="img-thumbnail m-auto" alt="YOU uploaded this, bub" />
            </Col>
          </Stack>
        )}
      </Col>
    </Stack>
  );
};
