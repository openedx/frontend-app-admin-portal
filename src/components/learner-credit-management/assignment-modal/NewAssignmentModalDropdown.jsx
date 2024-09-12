import { Dropdown, Stack } from '@openedx/paragon';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { useState } from 'react';
import {
  getNormalizedEnrollByDate,
  getNormalizedStartDate,
  SHORT_MONTH_DATE_FORMAT,
} from '../data';

const messages = defineMessages({
  byDate: {
    id: 'lcm.budget.detail.page.catalog.search.results.assign.dropdown.header.by-date',
    defaultMessage: 'By date',
    description: 'Dropdown header for the catalog search results section on the lcm budget detail page with available dates',
  },
  noAvailableDates: {
    id: 'lcm.budget.detail.page.catalog.search.results.assign.dropdown.header.no-available-dates',
    defaultMessage: 'No available dates',
    description: 'Dropdown header for the catalog search results section on the lcm budget detail page with no available dates',
  },
});

const NewAssignmentModalDropdown = ({
  id: courseKey, onClick: openAssignmentModal, courseRuns, children,
}) => {
  const intl = useIntl();
  const [clickedDropdownItem, setClickedDropdownItem] = useState(null);
  const getDropdownItemClassName = (courseRun) => {
    if (clickedDropdownItem && clickedDropdownItem.key === courseRun.key) {
      return null;
    }
    return 'text-muted';
  };
  const startLabel = ({ start }) => (dayjs(start).isBefore(dayjs()) ? 'Started' : 'Starts');
  return (
    <Dropdown id={courseKey}>
      <Dropdown.Toggle variant="primary" id="assign-by-course-runs-dropdown">
        {children}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header className="text-uppercase">
          {courseRuns.length > 0 ? intl.formatMessage(messages.byDate) : intl.formatMessage(messages.noAvailableDates) }
        </Dropdown.Header>
        {courseRuns.length > 0 && courseRuns.map(courseRun => (
          <Dropdown.Item
            key={courseRun.key}
            id={courseRun.key}
            onClick={openAssignmentModal}
            onMouseDown={() => setClickedDropdownItem(courseRun)}
            onMouseUp={() => setClickedDropdownItem(null)}
          >
            <Stack>
              Enroll by {dayjs(getNormalizedEnrollByDate(courseRun)).format(SHORT_MONTH_DATE_FORMAT)}
              <span className={`small ${getDropdownItemClassName(courseRun)}`}>
                {startLabel(courseRun)} {dayjs(getNormalizedStartDate(courseRun)).format(SHORT_MONTH_DATE_FORMAT)}
              </span>
            </Stack>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

NewAssignmentModalDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  courseRuns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    enrollBy: PropTypes.string,
    start: PropTypes.string,
  })).isRequired,
  children: PropTypes.node.isRequired,
};

export default NewAssignmentModalDropdown;
