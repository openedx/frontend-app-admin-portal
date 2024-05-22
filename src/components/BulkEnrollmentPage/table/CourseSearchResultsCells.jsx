import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Popover, Button, OverlayTrigger } from '@openedx/paragon';

import { configuration } from '../../../config';

const HREF_TITLE = 'Learn more about this course';

export const CourseNameCell = ({ value, row, enterpriseSlug }) => (
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
    <Button variant="link" className="text-left">{value}</Button>
  </OverlayTrigger>
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
    {dayjs(startValue).format('MMM D, YYYY')} - {dayjs(endValue).format('MMM D, YYYY')}
  </span>
);

FormattedDateCell.propTypes = {
  startValue: PropTypes.string.isRequired,
  endValue: PropTypes.string.isRequired,
};
