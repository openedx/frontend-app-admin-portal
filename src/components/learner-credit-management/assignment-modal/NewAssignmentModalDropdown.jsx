import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Dropdown, Stack } from '@openedx/paragon';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { SHORT_MONTH_DATE_FORMAT } from '../data';

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
  enrollBy: {
    id: 'lcm.budget.detail.page.catalog.search.results.assign.dropdown.enroll-by-date-item',
    defaultMessage: 'Enroll by {enrollByDate}',
    description: 'Dropdown item for the catalog search results section on the lcm budget detail enroll-by date',
  },
  startDate: {
    id: 'lcm.budget.detail.page.catalog.search.results.assign.dropdown.starts-date-item',
    defaultMessage: '{startLabel} {startDate}',
    description: 'Dropdown item for the catalog search results section on the lcm budget detail start date',
  },
});

const NewAssignmentModalDropdown = ({
  id: courseKey,
  onClick: openAssignmentModal,
  courseRuns,
  children,
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
    <Dropdown
      onSelect={(eventKey, event) => {
        const courseRunKey = event.target.closest('[data-courserunkey]').getAttribute('data-courserunkey');
        const selectedCourseRun = courseRuns.find(({ key }) => key === courseRunKey);
        openAssignmentModal(selectedCourseRun);
      }}
    >
      <Dropdown.Toggle variant="primary" id={`assign-by-course-runs-dropdown-for-${courseKey}`}>
        {children}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header className="text-uppercase">
          {courseRuns.length > 0 ? intl.formatMessage(messages.byDate) : intl.formatMessage(messages.noAvailableDates) }
        </Dropdown.Header>
        {courseRuns.length > 0 && courseRuns.map(courseRun => (
          <Dropdown.Item
            key={courseRun.key}
            data-courserunkey={courseRun.key}
            onMouseDown={() => setClickedDropdownItem(courseRun)}
            onMouseUp={() => setClickedDropdownItem(null)}
          >
            <Stack>
              {intl.formatMessage(messages.startDate, {
                startLabel: startLabel(courseRun),
                startDate: dayjs(courseRun.start).format(SHORT_MONTH_DATE_FORMAT),
              })}
              <span className={`small ${getDropdownItemClassName(courseRun)}`}>
                {intl.formatMessage(messages.enrollBy, {
                  enrollByDate: dayjs(courseRun.enrollBy).format(SHORT_MONTH_DATE_FORMAT),
                })}
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
