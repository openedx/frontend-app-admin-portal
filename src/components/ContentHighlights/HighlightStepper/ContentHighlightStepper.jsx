import React, {
  useState, useContext,
} from 'react';
import {
  Stepper, FullscreenModal, Button,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import HighlightStepperTitle from './HighlightStepperTitle';
import HighlightStepperSelectCourses from './HighlightStepperSelectCourses';
import HighlightStepperConfirmCourses from './HighlightStepperConfirmCourses';
import HighlightStepperConfirmHighlight from './HighlightStepperConfirmHighlight';
import HighlightStepperFooterHelpLink from './HighlightStepperFooterHelpLink';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import {
  toggleStepperModalAction,
  setStepperHighlightTitle,
  setStepperHighlightCreated,
  setStepperHighlightPublished,
} from '../data/actions';

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
const ContentHighlightStepper = ({ isModalOpen }) => {
  /* eslint-disable no-unused-vars */
  const steps = ['Title', 'Select courses', 'Confirm and Publish', 'All Set'];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const { dispatch, stepperModal: { isOpen, highlightTitle }, stepperData } = useContext(ContentHighlightsContext);
  const submitAndReset = () => {
    if (steps.indexOf(currentStep) === steps.length - 1) {
      /* TODO: submit data to api if confirmed */
      setCurrentStep(steps[0]);
      /* TODO: reset stepper data in context */
      // dispatch(setStepper)
    }
    dispatch(toggleStepperModalAction({ isOpen: false }));
  };
  const validateStepsAndContinue = () => {
    if (currentStep === steps[0] && highlightTitle && highlightTitle.length < 61) {
      dispatch(setStepperHighlightCreated({ createdHighlight: true }));
      dispatch(setStepperHighlightPublished({ publishedHighlight: false }));
      setCurrentStep(steps[1]);
    }
  };
  const clearDataAndClose = () => {
    dispatch(setStepperHighlightTitle({ highlightTitle: '' }));
    dispatch(toggleStepperModalAction({ isOpen: false }));
  };

  return (
    <>
      <Stepper activeKey={currentStep}>
        <FullscreenModal
          title="New Highlight"
          className="bg-light-200"
          isOpen={isModalOpen}
          onClose={() => {
            submitAndReset();
          }}
          beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
          footerNode={(
            <>
              <Stepper.ActionRow eventKey="Title">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                {/* Eventually would need a check to see if the user has made any changes
                to the form before allowing them to close the modal without saving. Ln 58 onClick */}
                <Button variant="tertiary" onClick={clearDataAndClose}>Cancel</Button>
                <Button variant="primary" onClick={validateStepsAndContinue}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="Select courses">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button variant="tertiary" onClick={() => setCurrentStep(steps[0])}>Back</Button>
                <Button variant="primary" onClick={() => setCurrentStep(steps[2])}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="Confirm and Publish">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button variant="tertiary" onClick={() => setCurrentStep(steps[1])}>Back</Button>
                <Button variant="primary" onClick={() => setCurrentStep(steps[3])}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="All Set">
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button variant="tertiary" onClick={() => setCurrentStep(steps[2])}>Back</Button>
                <Button variant="primary" onClick={() => submitAndReset()}>Confirm</Button>
              </Stepper.ActionRow>
            </>
          )}
        >
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
        </FullscreenModal>
      </Stepper>
    </>
  );
};

ContentHighlightStepper.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
};

export default ContentHighlightStepper;
