import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ActionRow, Button, FullscreenModal } from '@edx/paragon';
import { connect } from 'react-redux';
import BulkEnrollContextProvider from './BulkEnrollmentContext';
import AddCoursesStep from './stepper/AddCoursesStep';
import ReviewStep from './stepper/ReviewStep';
import BulkEnrollmentSubmit from './stepper/BulkEnrollmentSubmit';

/**
 * Full screen dialog to house Bulk enrollment workflow that starts after selecting learners and
 * clicking 'Enroll'. Course selection will happen as part of the workflow in this window.
 *
 * @param {object} args
 * @param {array<object>} args.learners learner email list to enroll
 * @param {object} args.subscription subscription plan to enroll into
 * @param {boolean} args.isOpen whether to show dialog (for controlling open/close)
 * @param {function} args.onClose handler to call on dialog close event
 * @returns Full screen modal dialog from Paragon
 */
const BulkEnrollDialog = ({
  enterpriseId, enterpriseSlug, learners, subscription, isOpen, onClose,
}) => {
  const COURSE_SELECT = 'COURSE_SELECT';
  const REVIEW_SELECTIONS = 'REVIEW_SELECTIONS';
  const [step, setStep] = useState(COURSE_SELECT);

  return (
    <BulkEnrollContextProvider initialEmailsList={learners}>
      <FullscreenModal
        hasCloseButton={false}
        title="Subscription Enrollment"
        isOpen={isOpen}
        onClose={onClose}
        footerNode={(
          <ActionRow>
            <ActionRow.Spacer />
            <Button variant="tertiary" onClick={onClose}>Cancel</Button>

            {step !== REVIEW_SELECTIONS
            && (
            <Button
              onClick={() => {
                if (step === COURSE_SELECT) {
                  setStep(REVIEW_SELECTIONS);
                }
              }}
            >Next
            </Button>
            )}

            {step === REVIEW_SELECTIONS
            && (
            <Button
              onClick={() => {
                setStep(COURSE_SELECT);
              }}
            >Previous
            </Button>
            )}

            {step === REVIEW_SELECTIONS
                && (
                <BulkEnrollmentSubmit
                  enterpriseId={enterpriseId}
                  enterpriseSlug={enterpriseSlug}
                  subscription={subscription}
                  returnToInitialStep={onClose}
                />
                )}
          </ActionRow>
        )}
      >
        {step === COURSE_SELECT && (
        <AddCoursesStep
          enterpriseId={enterpriseId}
          enterpriseSlug={enterpriseSlug}
          subscription={subscription}
        />
        )}
        {step === REVIEW_SELECTIONS && (
        <ReviewStep returnToSelection={() => setStep(COURSE_SELECT)} />
        )}
      </FullscreenModal>
    </BulkEnrollContextProvider>
  );
};

BulkEnrollDialog.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  learners: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  subscription: PropTypes.shape({ title: PropTypes.string.isRequired }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BulkEnrollDialog);
