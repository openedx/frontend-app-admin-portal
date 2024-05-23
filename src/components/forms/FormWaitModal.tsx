import React from 'react';
import { AlertModal, Spinner } from '@openedx/paragon';
import { useFormContext } from './FormContext';
import type { FormContext } from './FormContext';

type FormWaitModalProps = {
  // FormContext state that when truthy, shows the modal
  triggerState: string;
  onClose: () => void;
  header: string;
  text: string;
};

// Modal shown when waiting for a background operation to complete in forms
const FormWaitModal = ({
  triggerState,
  onClose,
  header,
  text,
}: FormWaitModalProps) => {
  const { stateMap }: FormContext = useFormContext();
  const isOpen = stateMap && stateMap[triggerState];

  return (
    <AlertModal title={header} isOpen={isOpen} onClose={onClose} hasCloseButton>
      <div className="d-flex mt-2 justify-content-center">
        <Spinner
          screenReaderText={text}
          animation="border"
          className="mr-2"
          variant="primary"
        />
      </div>
      <p className="mt-3">{text}</p>
    </AlertModal>
  );
};

export default FormWaitModal;
