import { useEffect, useState } from 'react';
import {
  setHighlightStepperModal,
} from './actions';
import { initialStepperModalState } from './reducer';

const useStepperModalState = (initialStepperModalStateValue = initialStepperModalState) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stepperModalState] = useState(setHighlightStepperModal, initialStepperModalStateValue);

  useEffect(() => {
    if (!stepperModalState?.isOpen) {
      setIsModalOpen(false);
    }
  }, [stepperModalState.isOpen]);

  return {
    isModalOpen,
    setIsModalOpen,
    stepperModalState,
  };
};
export default useStepperModalState;
