import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Stepper, Button, Container,
} from '@edx/paragon';

import AddCoursesStep from './AddCoursesStep';
import ReviewStep from './ReviewStep';
import {
  PREV_BUTTON_TEST_ID,
  NEXT_BUTTON_TEXT,
  PREVIOUS_BUTTON_TEXT,
  NEXT_BUTTON_TEST_ID,
  REVIEW_STEP,
  ADD_COURSES_STEP,
  ADD_COURSES_TITLE,
  REVIEW_TITLE,
} from './constants';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import BulkEnrollmentSubmit from './BulkEnrollmentSubmit';

const BulkEnrollmentStepper = ({
  subscription, enterpriseSlug, enterpriseId, onEnrollComplete,
}) => {
  const steps = [ADD_COURSES_STEP, REVIEW_STEP];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const { courses: [selectedCourses] } = useContext(BulkEnrollContext);

  return (
    <Stepper activeKey={currentStep}>
      <Stepper.Header className="my-3" />
      <div className="sticky-footer-wrapper">
        <Container size="xl">
          <Stepper.Step eventKey={ADD_COURSES_STEP} title={ADD_COURSES_TITLE}>
            <AddCoursesStep
              enterpriseId={enterpriseId}
              enterpriseSlug={enterpriseSlug}
              subscription={subscription}
              selectedCoursesNum={selectedCourses.length}
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
              onClick={() => setCurrentStep(REVIEW_STEP)}
              data-testid={NEXT_BUTTON_TEST_ID}
              disabled={selectedCourses.length < 1}
            >
              {NEXT_BUTTON_TEXT}
            </Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="review">
            <Button
              variant="outline-primary"
              onClick={() => setCurrentStep(ADD_COURSES_STEP)}
              data-testid={PREV_BUTTON_TEST_ID}
            >
              {PREVIOUS_BUTTON_TEXT}
            </Button>
            <Stepper.ActionRow.Spacer />
            <BulkEnrollmentSubmit
              enterpriseId={enterpriseId}
              enterpriseSlug={enterpriseSlug}
              subscription={subscription}
              returnToInitialStep={() => { setCurrentStep(ADD_COURSES_STEP); onEnrollComplete(); }}
            />
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
  onEnrollComplete: PropTypes.func.isRequired,
};

export default BulkEnrollmentStepper;
