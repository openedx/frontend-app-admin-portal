import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Stepper, Button, Container,
} from '@edx/paragon';
import AddCoursesStep from './AddCoursesStep';
import AddLearnersStep from './AddLearnersStep';
import ReviewStep from './ReviewStep';
import {
  NEXT_BUTTON_TEXT, PREVIOUS_BUTTON_TEXT, FINAL_BUTTON_TEXT, PREV_BUTTON_TEST_ID, FINAL_BUTTON_TEST_ID,
  NEXT_BUTTON_TEST_ID,
  ADD_LEARNERS_STEP,
  REVIEW_STEP,
  ADD_COURSES_STEP,
  ADD_COURSES_TITLE,
  ADD_LEARNERS_TITLE,
  REVIEW_TITLE,
} from './constants';
import { BulkEnrollContext } from '../BulkEnrollmentContext';

const BulkEnrollmentStepper = ({ subscription, enterpriseSlug, enterpriseId }) => {
  const steps = [ADD_COURSES_STEP, ADD_LEARNERS_STEP, REVIEW_STEP];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const { emails: [selectedEmails], courses: [selectedCourses] } = useContext(BulkEnrollContext);
  const hasSelectedCoursesAndEmails = selectedEmails.length > 0 && selectedCourses.length > 0;

  return (
    <Stepper activeKey={currentStep}>
      <Stepper.Header className="my-3" />
      <div className="sticky-stepper-footer">
        <Container size="xl">
          <Stepper.Step eventKey={ADD_COURSES_STEP} title={ADD_COURSES_TITLE}>
            <AddCoursesStep
              enterpriseId={enterpriseId}
              enterpriseSlug={enterpriseSlug}
              subscription={subscription}
              goToNextStep={() => setCurrentStep(ADD_LEARNERS_STEP)}
            />
          </Stepper.Step>

          <Stepper.Step eventKey={ADD_LEARNERS_STEP} title={ADD_LEARNERS_TITLE}>
            <AddLearnersStep
              subscriptionUUID={subscription.uuid}
              enterpriseSlug={enterpriseSlug}
            />
          </Stepper.Step>

          <Stepper.Step eventKey={REVIEW_STEP} title={REVIEW_TITLE}>
            <ReviewStep setCurrentStep={setCurrentStep} />
          </Stepper.Step>
        </Container>
        <Container size="xl" className="pb-3 pt-5">
          <Stepper.ActionRow eventKey={ADD_COURSES_STEP}>
            <Stepper.ActionRow.Spacer />
            <Button
              onClick={() => setCurrentStep(ADD_LEARNERS_STEP)}
              data-testid={NEXT_BUTTON_TEST_ID}
              disabled={selectedCourses.length < 1}
            >
              {NEXT_BUTTON_TEXT}
            </Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey={ADD_LEARNERS_STEP}>
            <Button
              variant="outline-primary"
              onClick={() => setCurrentStep(ADD_COURSES_STEP)}
              data-testid={PREV_BUTTON_TEST_ID}
            >
              {PREVIOUS_BUTTON_TEXT}
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button
              onClick={() => setCurrentStep(REVIEW_STEP)}
              data-testid={NEXT_BUTTON_TEST_ID}
              disabled={selectedEmails.length < 1}
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
            <Button
              disabled={!hasSelectedCoursesAndEmails}
              data-testid={FINAL_BUTTON_TEST_ID}
            >
              {FINAL_BUTTON_TEXT}
            </Button>
          </Stepper.ActionRow>
        </Container>
      </div>
    </Stepper>
  );
};

BulkEnrollmentStepper.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }).isRequired,
};

export default BulkEnrollmentStepper;
