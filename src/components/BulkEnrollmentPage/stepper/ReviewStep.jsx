import React, { useContext } from 'react';
import { Row } from '@edx/paragon';
import PropTypes from 'prop-types';

import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { REVIEW_TITLE } from './constants';
import ReviewList from './ReviewList';
import ReviewStepCourseList from './ReviewStepCourseList';

const LEARNERS = {
  singular: 'learner',
  plural: 'learners',
  title: 'Learners',
  removal: 'Remove learner',
};

const ReviewStep = ({ returnToLearnerSelection, returnToCourseSelection }) => {
  const {
    emails: [selectedEmails, emailsDispatch],
  } = useContext(BulkEnrollContext);

  return (
    <>
      <p>
        You&apos;re almost done! Review your selections and make any final changes before completing enrollment for
        your learners.
      </p>
      <h2 className="mb-4">{REVIEW_TITLE}</h2>
      <Row>
        <ReviewStepCourseList
          returnToSelection={returnToCourseSelection}
        />
        <ReviewList
          rows={selectedEmails}
          accessor="userEmail"
          dispatch={emailsDispatch}
          subject={LEARNERS}
          returnToSelection={returnToLearnerSelection}
        />
      </Row>
    </>
  );
};

ReviewStep.propTypes = {
  /* Function to return to prior step */
  returnToLearnerSelection: PropTypes.func.isRequired,
  returnToCourseSelection: PropTypes.func.isRequired,
};

export default ReviewStep;
