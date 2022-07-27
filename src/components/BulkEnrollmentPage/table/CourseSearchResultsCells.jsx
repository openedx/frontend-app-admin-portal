import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Button, OverlayTrigger } from '@edx/paragon';

import moment from 'moment';

import { configuration } from '../../../config';

const HREF_TITLE = 'Learn more about this course';

export function CourseNameCell({ value, row, enterpriseSlug }) {
  return (
    <OverlayTrigger
      trigger="click"
      rootClose
      key="top"
      placement="top"
      overlay={(
        <Popover id="popover-positioned-top">
          <Popover.Title>{value}</Popover.Title>
          <Popover.Content>
            <div
              className="desc"
            /* eslint-disable-next-line */
            dangerouslySetInnerHTML={{ __html: row?.original?.short_description }}
            />
            <hr />
            <a
              href={`${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row?.original?.key}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {HREF_TITLE}
            </a>
          </Popover.Content>
        </Popover>
      )}
    >
      <Button variant="link">{value}</Button>
    </OverlayTrigger>
  );
}

CourseNameCell.propTypes = {
  value: PropTypes.string.isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      key: PropTypes.string.isRequired,
    }),
  }).isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export function FormattedDateCell({ startValue, endValue }) {
  return (
    <span>
      {moment(startValue).format('MMM D, YYYY')} - {moment(endValue).format('MMM D, YYYY')}
    </span>
  );
}

FormattedDateCell.propTypes = {
  startValue: PropTypes.string.isRequired,
  endValue: PropTypes.string.isRequired,
};
