import React, { useContext } from 'react';
import { Row } from '@edx/paragon';
import PropTypes from 'prop-types';

import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { ADD_LEARNERS_STEP, ADD_COURSES_STEP, REVIEW_TITLE } from './constants';
import ReviewList from './ReviewList';

const LEARNERS = {
  singular: 'learner',
  plural: 'learners',
  title: 'Learners',
};

const COURSES = {
  singular: 'course',
  plural: 'courses',
  title: 'Courses',
};

const ReviewStep = ({ setCurrentStep }) => {
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
          returnToSelection={() => setCurrentStep(ADD_COURSES_STEP)}
        />
        <ReviewList
          key="emails"
          rows={selectedEmails}
          accessor="userEmail"
          dispatch={emailsDispatch}
          subject={LEARNERS}
          returnToSelection={() => setCurrentStep(ADD_LEARNERS_STEP)}
        />
      </Row>
    </>
  );
};

ReviewStep.propTypes = {
  /* Function from the stepper to change steps */
  setCurrentStep: PropTypes.func.isRequired,
};

export default ReviewStep;
