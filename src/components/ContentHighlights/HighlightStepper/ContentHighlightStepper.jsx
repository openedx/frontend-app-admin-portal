import React, { useState, useReducer, useEffect } from 'react';
import {
  Stepper, FullscreenModal, Container, Button,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import {
  setHighlightStepperModal,
} from '../data/actions';
import { initialStepperModalState, stepperModalReducer } from '../data/reducer';
import HighlightStepperTitle from './HighlightStepperTitle';
import HighlightStepperSelectCourses from './HighlightStepperSelectCourses';
import HighlightStepperConfirmCourses from './HighlightStepperConfirmCourses';
import HighlightStepperConfirmHighlight from './HighlightStepperConfirmHighlight';
import HighlightStepperFooterHelpLink from './HighlightStepperFooterHelpLink';

const ContentHighlightStepper = ({ openModal }) => {
  /* Stepper Modal currently accessible from:
  - ContentHighlightSetCard.jsx
  - CurrentContentHighlightHeader.jsx
  - ZeroStateHighlights.jsx
  */
  /* eslint-disable no-unused-vars */
  const [stepperModalState, dispatch] = useReducer(stepperModalReducer, initialStepperModalState);
  const steps = ['Title', 'Select courses', 'Confirm and Publish', 'All Set'];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [modalState, setModalState] = useState(openModal);
  useEffect(() => {
    setModalState(openModal);
  }, [openModal]);
  const submitAndReset = () => {
    if (steps.indexOf(currentStep) === steps.length - 1) {
      /* submit data to api if confirmed */
      setCurrentStep(steps[0]);
    }

    dispatch(setHighlightStepperModal(false));
    setModalState(false);
  };
  return (
    <>
      <Stepper activeKey={currentStep}>
        <FullscreenModal
          title="New Highlight"
          className="bg-light-200"
          isOpen={modalState}
          onClose={() => {
            submitAndReset();
          }}
          beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
          footerNode={(
            <>
              <Stepper.ActionRow eventKey="Title">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button onClick={() => submitAndReset()}>Back</Button>
                <Button onClick={() => setCurrentStep('Select courses')}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="Select courses">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button onClick={() => setCurrentStep('Title')}>Back</Button>
                <Button onClick={() => setCurrentStep('Confirm and Publish')}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="Confirm and Publish">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button onClick={() => setCurrentStep('Select courses')}>Back</Button>
                <Button onClick={() => setCurrentStep('All Set')}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="All Set">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button onClick={() => setCurrentStep('Confirm and Publish')}>Back</Button>
                <Button onClick={() => submitAndReset()}>Confirm</Button>
              </Stepper.ActionRow>
            </>
    )}
        >
          <Container size="md">
            <Stepper.Step eventKey="Title" title={steps[0]}>
              <HighlightStepperTitle />
            </Stepper.Step>

            <Stepper.Step eventKey="Select courses" title={steps[1]}>
              <HighlightStepperSelectCourses />
            </Stepper.Step>

            <Stepper.Step eventKey="Confirm and Publish" title={steps[2]}>
              <HighlightStepperConfirmCourses />
            </Stepper.Step>

            <Stepper.Step eventKey="All Set" title={steps[3]}>
              <HighlightStepperConfirmHighlight />
            </Stepper.Step>

          </Container>
        </FullscreenModal>
      </Stepper>
    </>
  );
};

ContentHighlightStepper.propTypes = {
  openModal: PropTypes.bool.isRequired,
};

export default ContentHighlightStepper;
