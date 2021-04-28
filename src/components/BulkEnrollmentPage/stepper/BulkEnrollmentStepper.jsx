import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FullscreenModal, Stepper, Button, Container,
} from '@edx/paragon';
import AddLearnersStep from './AddLearnersStep';
import ReviewStep from './ReviewStep';
import {
  STEPPER_TITLE, NEXT_BUTTON_TEXT, PREVIOUS_BUTTON_TEXT, FINAL_BUTTON_TEXT, PREV_BUTTON_TEST_ID, FINAL_BUTTON_TEST_ID,
  NEXT_BUTTON_TEST_ID,
  ADD_LEARNERS_STEP,
  REVIEW_STEP,
} from './constants';
import { BulkEnrollContext } from '../BulkEnrollmentContext';

// TODO: Clear table selections on close
const BulkEnrollmentStepper = ({ isOpen, close, subscriptionUUID }) => {
  const steps = [ADD_LEARNERS_STEP, REVIEW_STEP];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const { emails: [selectedEmails], courses: [selectedCourses] } = useContext(BulkEnrollContext);
  const hasSelectedCoursesAndEmails = selectedEmails.length > 0 && selectedCourses.length > 0;

  return (
    <>
      <Stepper activeKey={currentStep}>
        <FullscreenModal
          title={STEPPER_TITLE}
          className="bg-light-200"
          isOpen={isOpen}
          onClose={close}
          beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
          footerNode={(
            <>
              <Stepper.ActionRow eventKey="addLearners">
                <Button variant="outline-primary" onClick={close}>
                  Cancel
                </Button>
                <Stepper.ActionRow.Spacer />
                <Button
                  onClick={() => setCurrentStep(REVIEW_STEP)}
                  data-testid={NEXT_BUTTON_TEST_ID}
                >
                  {NEXT_BUTTON_TEXT}
                </Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="review">
                <Button
                  variant="outline-primary"
                  onClick={() => setCurrentStep(ADD_LEARNERS_STEP)}
                  data-testid={PREV_BUTTON_TEST_ID}
                >
                  {PREVIOUS_BUTTON_TEXT}
                </Button>
                <Stepper.ActionRow.Spacer />
                <Button disabled={!hasSelectedCoursesAndEmails} onClick={close} data-testid={FINAL_BUTTON_TEST_ID}>{FINAL_BUTTON_TEXT}</Button>
              </Stepper.ActionRow>
            </>
          )}
        >
          <Container size="lg">
            <Stepper.Step eventKey="addLearners" title="Add learners">
              <AddLearnersStep subscriptionUUID={subscriptionUUID} />
            </Stepper.Step>

            <Stepper.Step eventKey="review" title="Review">
              <ReviewStep setCurrentStep={setCurrentStep} close={close} />
            </Stepper.Step>
          </Container>
        </FullscreenModal>
      </Stepper>
    </>
  );
};

BulkEnrollmentStepper.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  subscriptionUUID: PropTypes.string.isRequired,
};

export default BulkEnrollmentStepper;
