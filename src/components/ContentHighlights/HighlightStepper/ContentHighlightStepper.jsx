import React, { useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import {
  Stepper, FullscreenModal, Button,
} from '@edx/paragon';

import HighlightStepperTitle from './HighlightStepperTitle';
import HighlightStepperSelectCourses from './HighlightStepperSelectCourses';
import HighlightStepperConfirmCourses from './HighlightStepperConfirmCourses';
import HighlightStepperFooterHelpLink from './HighlightStepperFooterHelpLink';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

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

  const isStepperModalOpen = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.isOpen);
  const titleStepValidationError = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.titleStepValidationError,
  );
  const highlightTitle = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.highlightTitle,
  );
  const setState = useContextSelector(ContentHighlightsContext, v => v[1]);

  const closeStepperModal = () => {
    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        isOpen: false,
        highlightTitle: null,
        currentSelectedRowIds: {},
      },
    }));
    setCurrentStep(steps[0]);
  };

  const submitAndReset = () => {
    if (steps.indexOf(currentStep) === steps.length - 1) {
      /* TODO: submit data to api if confirmed */
      // setCurrentStep(steps[0]);
      /* TODO: reset stepper data in context */
      // dispatch(setStepper)
    }
    closeStepperModal();
  };

  return (
    <Stepper activeKey={currentStep}>
      <FullscreenModal
        title="New highlight"
        className="bg-light-200"
        isOpen={isStepperModalOpen}
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
                disabled={!!titleStepValidationError || !highlightTitle}
              >
                Next
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.SELECT_COURSES}>
              <HighlightStepperFooterHelpLink />
              <Stepper.ActionRow.Spacer />
              <Button
                variant="tertiary"
                onClick={() => setCurrentStep(STEPPER_STEP_LABELS.CREATE_TITLE)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep(STEPPER_STEP_LABELS.CONFIRM_PUBLISH)}
              >
                Next
              </Button>
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
          hasError={!!titleStepValidationError}
          description={titleStepValidationError || ''}
          index={steps.indexOf(STEPPER_STEP_LABELS.CREATE_TITLE)}
        >
          <HighlightStepperTitle />
        </Stepper.Step>

        <Stepper.Step
          eventKey={STEPPER_STEP_LABELS.SELECT_COURSES}
          title={STEPPER_STEP_LABELS.SELECT_COURSES}
          index={steps.indexOf(STEPPER_STEP_LABELS.SELECT_COURSES)}
        >
          <HighlightStepperSelectCourses />
        </Stepper.Step>

        <Stepper.Step
          eventKey={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}
          title={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}
          index={steps.indexOf(STEPPER_STEP_LABELS.CONFIRM_PUBLISH)}
        >
          <HighlightStepperConfirmCourses />
        </Stepper.Step>
      </FullscreenModal>
    </Stepper>
  );
};

export default ContentHighlightStepper;
