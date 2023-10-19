import React, { ChangeEvent, useEffect, useState } from 'react';
import { UseFormRegister } from 'react-hook-form';

export const ImageUploader = ({ register, fieldName }: { register: UseFormRegister<any>; fieldName: string }) => {
  // const objectUrl = URL.createObjectURL(selectedFile)
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
    <div className="mt-2 d-flex flex-column">
      <div className="col mb-1">
        <label htmlFor="image">Upload new Image</label>
      </div>
      <div className="col">
        <input
          {...register(fieldName)}
          type="file"
          id="image"
          className="form-control"
          onChange={onSelectFile}
          accept="image/png, image/gif, image/jpeg, image/jpg"
        />

        {selectedFile && (
          <div className="d-flex align-items-center flex-column">
            <div className="col-6">Preview:</div>
            <div className="col-6">
              <img src={preview} className="img-thumbnail m-auto" alt="temp image YOU uploaded, bub" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
