import { redirectDocument, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { createService, fetchServiceById, updateServiceById } from '../../data/services';
import { IClientService, IServiceWithImageUpload } from '../../types/service';
import { useForm } from 'react-hook-form';
import { ImageUploader } from './subcomponents/ImageUploader';
import { Button, Col, Container, FloatingLabel, Form, Row, Stack, ToastContainer, Toast, FormControl } from 'react-bootstrap';
import { ServiceImage } from '../../components/ServiceImage';
import { ServiceType } from '@justreadcomics/common/dist/types/services';

interface IServiceForm {
  serviceName?: string;
  type?: ServiceType;
  siteUrl?: string;
  searchUrl?: string;
  imageBlob?: File[];
}

export const AdminServiceEdit = () => {
  let { id } = useParams();
  const [service, setService] = useState<IClientService>();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const { register, handleSubmit } = useForm<IServiceForm>({
    defaultValues: async () => {
      if (id) {
        return fetchServiceById(id).then((res) => {
          const { serviceName, type, siteUrl, searchUrl } = res;
          return { serviceName, type, siteUrl, searchUrl };
        });
      }
      return {};
    }
  });
  useEffect(() => {
    if (id) {
      fetchServiceById(id).then((res) => {
        setService(res);
      });
    }
  }, [id]);

  if (!service) {
    return <div>Loading!</div>;
  }

  const showToast = () => {
    setShowSuccessToast(true);
  };

  const saveService = handleSubmit((serviceForm) => {
    let file;
    if (serviceForm.imageBlob?.length) {
      file = serviceForm.imageBlob[0];
    }
    const updatedService: Partial<IServiceWithImageUpload> = {
      ...service,
      ...serviceForm,
      imageBlob: file
    };
    let promise;
    if (id) {
      promise = updateServiceById(updatedService);
    } else {
      promise = createService(updatedService);
    }
    promise.then((res) => {
      showToast();
      redirectDocument(`/admin/service/${res._id}`);
    });
  });

  return (
    <Container>
      <Form onSubmit={saveService}>
        <Stack direction="horizontal" className="justify-content-between align-items-center">
          <h3 className="mt-3 mb-3">Editing Service: {service?.serviceName}</h3>
          <Button type="submit">Save</Button>
        </Stack>
        <Row className="row">
          <Col xs={4} className="mb-3">
            <ServiceImage service={service} />
            <ImageUploader register={register} fieldName={'imageBlob'} />
          </Col>
          <Col>
            <FloatingLabel className="mb-3" label="Service Name" controlId="serviceName">
              <input {...register('serviceName')} className="form-control" id="serviceName" placeholder="Hoopla" />
            </FloatingLabel>
            <FloatingLabel className="mb-3" label="Service Type" controlId="type">
              <Form.Select id="type" {...register('type')}>
                <option value={ServiceType.FREE}>Free</option>
                <option value={ServiceType.PAID}>Paid</option>
                <option value={ServiceType.SUBSCRIPTION}>Subscription</option>
                <option value={ServiceType.NONE}>None</option>
              </Form.Select>
            </FloatingLabel>
            <FloatingLabel className="mb-3" controlId="siteUrl" label="Service Homepage">
              <input {...register('siteUrl')} className="form-control" id="siteUrl" placeholder="https://google.com/" />
            </FloatingLabel>
            <FloatingLabel className="mb-3" controlId="searchUrl" label="Search URL">
              <FormControl {...register('searchUrl')} type="text" id="searchUrl" placeholder="https://google.com/search?q=%s" />
              <sub>
                This will be used to perform automated searches. Please include the search query with <strong>%s</strong> in the URL to search against.
              </sub>
              <br />
              <sub>
                ex: https://www.google.com/search<strong>?q=%s</strong>
              </sub>
            </FloatingLabel>
          </Col>
        </Row>
      </Form>
      <ToastContainer position="bottom-end" className="p-3">
        <Toast onClose={() => setShowSuccessToast(false)} show={showSuccessToast} autohide delay={3000} bg="primary">
          <Toast.Body>
            <Stack direction="horizontal" className="justify-content-between">
              <span>Successfully saved!</span>
              <Button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></Button>
            </Stack>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};
