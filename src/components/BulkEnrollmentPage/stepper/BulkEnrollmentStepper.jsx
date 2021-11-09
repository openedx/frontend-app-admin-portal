import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button, ModalDialog, Stepper,
} from '@edx/paragon';

import BulkEnrollmentSubmit from './BulkEnrollmentSubmit';
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

/**
 * Modal dialog to house Bulk enrollment workflow that starts after selecting learners and
 * clicking 'Enroll'. Course selection will happen as part of the workflow in this window.
 * Learner emails will be sourced from whatever learner emails were selected before opening this
 * dialog, from the license management bulk actions table
 *
 * @param {object} args
 * @param {object} args.subscription subscription plan to enroll into
 * @param {boolean} args.isOpen whether to show dialog (for controlling open/close)
 * @param {function} args.onClose handler to call on dialog close event
 * @returns Modal dialog from Paragon
 */
const BulkEnrollStepper = ({
  enterpriseId, enterpriseSlug, subscription, isOpen, onClose,
}) => {
  const steps = [ADD_COURSES_STEP, REVIEW_STEP];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const { courses: [selectedCourses] } = useContext(BulkEnrollContext);

  return (
    <Stepper activeKey={currentStep}>
      <ModalDialog
        hasCloseButton
        isFullscreenOnMobile
        title="Subscription Enrollment"
        isOpen={isOpen}
        size="xl"
        onClose={onClose}
        className="bulk-enroll-modal"
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            Subscription Enrollment
          </ModalDialog.Title>
        </ModalDialog.Header>

        <ModalDialog.Body>
          <Stepper.Step eventKey={ADD_COURSES_STEP} title={ADD_COURSES_TITLE}>
            <AddCoursesStep
              enterpriseId={enterpriseId}
              enterpriseSlug={enterpriseSlug}
              subscription={subscription}
              selectedCoursesNum={selectedCourses.length}
            />
          </Stepper.Step>
          <Stepper.Step eventKey={REVIEW_STEP} title={REVIEW_TITLE}>
            <ReviewStep
              returnToLearnerSelection={onClose}
              returnToCourseSelection={() => setCurrentStep(ADD_COURSES_STEP)}
            />
          </Stepper.Step>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Stepper.ActionRow eventKey={ADD_COURSES_STEP}>
            <Button
              onClick={() => setCurrentStep(REVIEW_STEP)}
              data-testid={NEXT_BUTTON_TEST_ID}
              disabled={selectedCourses.length < 1}
            >
              {NEXT_BUTTON_TEXT}
            </Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey={REVIEW_STEP}>
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
              onEnrollComplete={onClose}
            />
          </Stepper.ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </Stepper>
  );
};

BulkEnrollStepper.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  subscription: PropTypes.shape({ title: PropTypes.string }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkEnrollStepper;
