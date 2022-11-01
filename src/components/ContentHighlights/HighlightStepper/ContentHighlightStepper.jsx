import React, {
  useState, useEffect, useContext,
} from 'react';
import {
  Stepper, FullscreenModal, Container, Button,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import HighlightStepperTitle from './HighlightStepperTitle';
import HighlightStepperSelectCourses from './HighlightStepperSelectCourses';
import HighlightStepperConfirmCourses from './HighlightStepperConfirmCourses';
import HighlightStepperConfirmHighlight from './HighlightStepperConfirmHighlight';
import HighlightStepperFooterHelpLink from './HighlightStepperFooterHelpLink';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
/**
 * Stepper Modal Currently accessible from:
 *  - ContentHighlightSetCard
 *  - CurrentContentHighlightHeader
 *  - ZeroStateHighlights
 *
 * @param {object} args Arugments
 * @param {boolean} args.isOpen Whether the modal containing the stepper is currently open.
 * @returns
 */
const ContentHighlightStepper = ({ isOpen }) => {
  const { setIsModalOpen } = useContext(ContentHighlightsContext);
  /* eslint-disable no-unused-vars */
  const steps = ['Title', 'Select courses', 'Confirm and Publish', 'All Set'];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [modalState, setModalState] = useState(isOpen);
  useEffect(() => {
    setModalState(isOpen);
  }, [isOpen]);
  const submitAndReset = () => {
    if (steps.indexOf(currentStep) === steps.length - 1) {
      /* TODO: submit data to api if confirmed */
      setCurrentStep(steps[0]);
    }
    setIsModalOpen(false);
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
                <Button variant="tertiary" onClick={() => submitAndReset()}>Back</Button>
                <Button variant="primary" onClick={() => setCurrentStep('Select courses')}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="Select courses">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button variant="tertiary" onClick={() => setCurrentStep('Title')}>Back</Button>
                <Button variant="primary" onClick={() => setCurrentStep('Confirm and Publish')}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="Confirm and Publish">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button variant="tertiary" onClick={() => setCurrentStep('Select courses')}>Back</Button>
                <Button variant="primary" onClick={() => setCurrentStep('All Set')}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="All Set">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button variant="tertiary" onClick={() => setCurrentStep('Confirm and Publish')}>Back</Button>
                <Button variant="primary" onClick={() => submitAndReset()}>Confirm</Button>
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
  isOpen: PropTypes.bool.isRequired,
};

export default ContentHighlightStepper;
