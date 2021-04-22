import React, { useContext } from 'react';
// import PropTypes from 'prop-types';

import { BulkEnrollContext } from '../BulkEnrollmentContext';

const ReviewStep = () => {
  const { emails: [selectedEmails], courses: [selectedCourses] } = useContext(BulkEnrollContext);

  return (
    <>
      <h2>Review</h2>
      <h3>Emails</h3>
      <ul>
        {selectedEmails.map((email) => <li>{email}</li>)}
      </ul>
      <h3>Courses</h3>
      <ul>
        {selectedCourses.map((course) => <li>{course.title}</li>)}
      </ul>
    </>
  );
};

export default ReviewStep;
