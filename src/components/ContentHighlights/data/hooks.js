import { useState } from 'react';

export const useStepperModalState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return {
    isModalOpen,
    setIsModalOpen,
  };
};

export const useStepperDataState = () => {
  const [stepperData, setStepperData] = useState({});
  return {
    stepperData,
    setStepperData,
  };
};
