import { useState } from 'react';

const useStepperModalState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return {
    isModalOpen,
    setIsModalOpen,
  };
};
export default useStepperModalState;
