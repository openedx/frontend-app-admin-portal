import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import { configuration } from '../../../config';

export const CourseNameCell = ({ value, row, enterpriseSlug }) => (
  <a
    href={`${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row?.original?.key}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {value}
  </a>
);

CourseNameCell.propTypes = {
  value: PropTypes.string.isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      key: PropTypes.string.isRequired,
    }),
  }).isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export const FormattedDateCell = ({ startValue, endValue }) => (
  <span>
    {moment(startValue).format('MMM D, YYYY')} - {moment(endValue).format('MMM D, YYYY')}
  </span>
);

FormattedDateCell.propTypes = {
  startValue: PropTypes.string.isRequired,
  endValue: PropTypes.string.isRequired,
};
