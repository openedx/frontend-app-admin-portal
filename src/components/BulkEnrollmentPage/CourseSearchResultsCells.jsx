import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import { configuration } from '../../config';

export const CourseNameCell = ({ value, row, enterpriseSlug }) => (
  <a href={`${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row?.original?.key}`}>{value}</a>
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

export const FormattedDateCell = ({ value }) => <span>{moment(value).format('MMM D, YYYY')}</span>;

FormattedDateCell.propTypes = {
  value: PropTypes.string.isRequired,
};
