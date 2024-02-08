import React from 'react';
import PropTypes from 'prop-types';

import BaseCourseCard from './BaseCourseCard';
import CourseCardFooterActions from './CourseCardFooterActions';

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
