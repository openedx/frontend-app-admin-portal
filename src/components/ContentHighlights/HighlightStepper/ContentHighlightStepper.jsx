import React, {
  useState, useContext,
} from 'react';
import {
  Stepper, FullscreenModal, Button,
} from '@edx/paragon';

import HighlightStepperTitle from './HighlightStepperTitle';
import HighlightStepperSelectCourses from './HighlightStepperSelectCourses';
import HighlightStepperConfirmCourses from './HighlightStepperConfirmCourses';
import HighlightStepperFooterHelpLink from './HighlightStepperFooterHelpLink';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import {
  toggleStepperModalAction,
  // setStepperHighlightTitle,
  // setStepperHighlightCreated,
  // setStepperHighlightPublished,
} from '../data/actions';

const STEPPER_STEP_LABELS = {
  CREATE_TITLE: 'Create a title',
  SELECT_COURSES: 'Select courses',
  CONFIRM_PUBLISH: 'Confirm and publish',
};

/**
 * Stepper to support create/edit user flow for a highlight set.
 */
const ContentHighlightStepper = () => {
  const steps = [
    STEPPER_STEP_LABELS.CREATE_TITLE,
    STEPPER_STEP_LABELS.SELECT_COURSES,
    STEPPER_STEP_LABELS.CONFIRM_PUBLISH,
  ];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const { dispatch, stepperModal: { isOpen } } = useContext(ContentHighlightsContext);

  const closeStepperModal = () => {
    dispatch(toggleStepperModalAction({ isOpen: false }));
  };

  const submitAndReset = () => {
    if (steps.indexOf(currentStep) === steps.length - 1) {
      /* TODO: submit data to api if confirmed */
      setCurrentStep(steps[0]);
      /* TODO: reset stepper data in context */
      // dispatch(setStepper)
    }
    closeStepperModal();
  };

  // const validateStepsAndContinue = () => {
  //   if (currentStep === steps[0] && highlightTitle && highlightTitle.length < 61) {
  //     dispatch(setStepperHighlightCreated({ createdHighlight: true }));
  //     dispatch(setStepperHighlightPublished({ publishedHighlight: false }));
  //     setCurrentStep(steps[1]);
  //   }
  // };

  // const clearDataAndClose = () => {
  //   dispatch(setStepperHighlightTitle({ highlightTitle: '' }));
  //   dispatch(toggleStepperModalAction({ isOpen: false }));
  // };

  return (
    <Stepper activeKey={currentStep}>
      <FullscreenModal
        title="New highlight"
        className="bg-light-200"
        isOpen={isOpen}
        onClose={() => {
          submitAndReset();
        }}
        beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
        footerNode={(
          <>
            <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.CREATE_TITLE}>
              <HighlightStepperFooterHelpLink />
              <Stepper.ActionRow.Spacer />
              {/* TODO: Eventually would need a check to see if the user has made any changes
                to the form before allowing them to close the modal without saving. */}
              <Button
                variant="tertiary"
                onClick={() => closeStepperModal()}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep(STEPPER_STEP_LABELS.SELECT_COURSES)}
              >
                Next
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.SELECT_COURSES}>
              <HighlightStepperFooterHelpLink />
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={() => setCurrentStep(STEPPER_STEP_LABELS.CREATE_TITLE)}>Back</Button>
              <Button variant="primary" onClick={() => setCurrentStep(STEPPER_STEP_LABELS.CONFIRM_PUBLISH)}>Next</Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}>
              <HighlightStepperFooterHelpLink />
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={() => setCurrentStep(STEPPER_STEP_LABELS.SELECT_COURSES)}>Back</Button>
              <Button variant="primary" onClick={() => submitAndReset()}>Confirm</Button>
            </Stepper.ActionRow>
          </>
          )}
      >
        <Stepper.Step
          eventKey={STEPPER_STEP_LABELS.CREATE_TITLE}
          title={STEPPER_STEP_LABELS.CREATE_TITLE}
        >
          <HighlightStepperTitle />
        </Stepper.Step>

        <Stepper.Step eventKey="Select courses" title={steps[1]}>
          <HighlightStepperSelectCourses />
        </Stepper.Step>

        <Stepper.Step eventKey="Confirm and publish" title={steps[2]}>
          <HighlightStepperConfirmCourses />
        </Stepper.Step>
      </FullscreenModal>
    </Stepper>
  );
};

export default ContentHighlightStepper;
