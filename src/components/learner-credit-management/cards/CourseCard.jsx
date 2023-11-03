import React from 'react';
import PropTypes from 'prop-types';
import { Button, Hyperlink } from '@edx/paragon';

import NewAssignmentModalButton from './NewAssignmentModalButton';
import CARD_TEXT from '../constants';
import BaseCourseCard from './BaseCourseCard';

const { BUTTON_ACTION } = CARD_TEXT;

const CourseCardFooterActions = ({ course }) => {
  const { linkToCourse } = course;

  return [
    <Button
      key="link-to-course"
      as={Hyperlink}
      data-testid="hyperlink-view-course"
      destination={linkToCourse}
      target="_blank"
      variant="outline-primary"
    >
      {BUTTON_ACTION.viewCourse}
    </Button>,
    <NewAssignmentModalButton key="assignment-modal-trigger" course={course}>
      {BUTTON_ACTION.assign}
    </NewAssignmentModalButton>,
  ];
};

const CourseCard = ({ original }) => (
  <BaseCourseCard
    original={original}
    footerActions={CourseCardFooterActions}
  />
);

CourseCard.propTypes = {
  original: PropTypes.shape().isRequired, // pass-thru prop to `BaseCourseCard`
};

export default CourseCard;
