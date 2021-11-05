import React, { useContext } from 'react';
import { Row } from '@edx/paragon';
import PropTypes from 'prop-types';

import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { REVIEW_TITLE } from './constants';
import ReviewList from './ReviewList';

const LEARNERS = {
  singular: 'learner',
  plural: 'learners',
  title: 'Learners',
  removal: 'Remove learner',
};

const COURSES = {
  singular: 'course',
  plural: 'courses',
  title: 'Courses',
  removal: 'Remove course',
};

const ReviewStep = ({ returnToSelection }) => {
  const {
    emails: [selectedEmails, emailsDispatch],
    courses: [selectedCourses, coursesDispatch],
  } = useContext(BulkEnrollContext);

  return (
    <>
      <p>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        You're almost done! Review your selections and make any final changes before completing enrollment for
        your learners.
      </p>
      <h2 className="mb-5">{REVIEW_TITLE}</h2>
      <Row>
        <ReviewList
          key="courses"
          rows={selectedCourses}
          accessor="title"
          dispatch={coursesDispatch}
          subject={COURSES}
          returnToSelection={returnToSelection}
        />
        <ReviewList
          key="emails"
          rows={selectedEmails}
          accessor="userEmail"
          dispatch={emailsDispatch}
          subject={LEARNERS}
          returnToSelection={returnToSelection}
        />
      </Row>
    </>
  );
};

ReviewStep.propTypes = {
  /* Function to return to prior step */
  returnToSelection: PropTypes.func.isRequired,
};

export default ReviewStep;
