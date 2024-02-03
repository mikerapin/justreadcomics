import { Button, Container, FormControl, Modal, ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';
import { IClientSeries } from '../../types/series';
import React from 'react';
import { IClientServiceAndSeriesService } from '../../types/service';
import { ServiceImage } from '../../components/ServiceImage';
import { useForm } from 'react-hook-form';
import { updateSeriesService } from '../../data/series';

interface EditSeriesServiceModalProps {
  seriesService: IClientServiceAndSeriesService | null;
  series: IClientSeries;
  showModal: boolean;
  handleClose: (updatedSeries?: IClientSeries) => void;
}

interface ISeriesServiceUpdateForm {
  seriesServiceUrl: string;
}

export const EditSeriesServiceModal = ({
  seriesService,
  series,
  handleClose,
  showModal
}: EditSeriesServiceModalProps) => {
  const { register, handleSubmit } = useForm<ISeriesServiceUpdateForm>({
    defaultValues: {
      seriesServiceUrl: seriesService?.seriesService.seriesServiceUrl
    }
  });
  const submitChanges = handleSubmit((seriesServiceUpdateForm) => {
    if (series._id && seriesService?.service._id) {
      // update series
      updateSeriesService(series._id, seriesService.service._id, seriesServiceUpdateForm.seriesServiceUrl).then(
        (res) => {
          const updatedSeries = res.series;
          handleClose(updatedSeries);
        }
      );
    }
  });
  if (!seriesService) {
    return <></>;
  }
  return (
    <Modal show={showModal} onHide={() => handleClose()} backdrop="static" keyboard={false}>
      <ModalHeader closeButton>
        <ModalTitle>
          Editing <ServiceImage service={seriesService.service} size="xs" /> {seriesService.service.serviceName}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Container>
          Update series URL:
          <FormControl {...register('seriesServiceUrl')} type="text" />
        </Container>
      </ModalBody>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleClose()}>
          Close
        </Button>
        <Button variant="primary" onClick={submitChanges}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
