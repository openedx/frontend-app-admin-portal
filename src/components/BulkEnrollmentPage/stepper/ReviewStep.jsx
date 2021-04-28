import React, { useContext } from 'react';
import { Delete } from '@edx/paragon/icons';
import {
  Card, IconButton, Icon, Alert, Button, Row,
} from '@edx/paragon';
// import PropTypes from 'prop-types';

import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { ADD_LEARNERS_STEP, REVIEW_TITLE } from './constants';
import { deleteSelectedRowAction } from '../data/actions';

const ReviewItem = ({ row, accessor, dispatch }) => (
  <li>
    <Card>
      <Card.Body>
        <Card.Text className="list-item">
          {row.values[accessor]}
          <IconButton
            src={Delete}
            iconAs={Icon}
            alt="Remove selection"
            onClick={() => dispatch(deleteSelectedRowAction(row.id))}
          />
        </Card.Text>
      </Card.Body>
    </Card>
  </li>
);

const ReviewList = ({
  rows, accessor, dispatch, subject, returnToSelection
}) => (
  <div className="col col-6">
    <h3>{subject.title}</h3>
    <ul className="be-review-list">
      {rows.length < 1 && (
        <Alert variant="danger">
          At least one {subject.singular} must be selected to enroll learners
          <Button variant="link" size="inline" onClick={returnToSelection}>Return to {subject.singular} selection</Button>
        </Alert>
      )}
      {rows.map((row) => <ReviewItem key={row.id} row={row} accessor={accessor} dispatch={dispatch} />)}
    </ul>
  </div>
);

const EMAILS = {
  singular: 'email',
  plural: 'emails',
  title: 'Emails',
};

const COURSES = {
  singular: 'course',
  plural: 'courses',
  title: 'Courses',
};

const ReviewStep = ({ setCurrentStep, close }) => {
  const {
    emails: [selectedEmails, emailsDispatch],
    courses: [selectedCourses, coursesDispatch],
  } = useContext(BulkEnrollContext);

  return (
    <>
      <p>You're almost done! Review your selections and make any final changes before completing enrollment for your learners</p>
      <h2 className="mb-5">{REVIEW_TITLE}</h2>
      <Row>
        <ReviewList
          key="emails"
          rows={selectedEmails}
          accessor="userEmail"
          dispatch={emailsDispatch}
          subject={EMAILS}
          returnToSelection={() => setCurrentStep(ADD_LEARNERS_STEP)}
        />
        <ReviewList
          key="courses"
          rows={selectedCourses}
          accessor="title"
          dispatch={coursesDispatch}
          subject={COURSES}
          returnToSelection={close}
        />
      </Row>
    </>
  );
};

export default ReviewStep;
