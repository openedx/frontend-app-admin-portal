import React from "react";
import { AlertModal, Spinner } from "@edx/paragon";
// @ts-ignore
import { useFormContext } from "./FormContext.tsx";
import type { FormContext } from "./FormContext";

type FormWaitModal = {
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
}: FormWaitModal) => {
  const { stateMap }: FormContext = useFormContext();

  const isOpen = stateMap && stateMap[triggerState];

  return (
    <AlertModal title={header} isOpen={isOpen} onClose={onClose} hasCloseButton>
      <div className="d-flex justify-content-center">
        <Spinner
          screenReaderText={text}
          animation="border"
          className="mr-2"
          variant="primary"
        />
      </div>
      <p>{text}</p>
    </AlertModal>
  );
};

export default FormWaitModal;
