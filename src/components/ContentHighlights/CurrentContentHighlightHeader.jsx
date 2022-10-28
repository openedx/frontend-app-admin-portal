import React, { useState, useEffect, useReducer } from 'react';
import {
  Button, ActionRow,
} from '@edx/paragon';
import {
  setHighlightStepperModal,
} from './data/actions';
import { initialStepperModalState } from './data/reducer';
import ContentHighlightStepper from './HighlightStepper/ContentHighlightStepper';

const CurrentContentHighlightHeader = () => {
  /* Stepper declarations and functions - Start */
  const [toggleModal, setToggleModal] = useState(false);
  const [stepperModalState] = useReducer(setHighlightStepperModal, initialStepperModalState);
  useEffect(() => {
    if (!stepperModalState?.isOpen) {
      setToggleModal(false);
    }
  }, [stepperModalState.isOpen]);
  /* Stepper declarations and functions - End */
  return (
    <>
      <ActionRow className="mb-4.5">
        <h2 className="m-0">
          Active Highlights
        </h2>
        <ActionRow.Spacer />
        <Button onClick={() => setToggleModal(true)}>New Highlight</Button>
      </ActionRow>
      <ContentHighlightStepper openModal={toggleModal} />
    </>
  );
};
export default CurrentContentHighlightHeader;
