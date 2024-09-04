import { Dropdown, Stack } from '@openedx/paragon';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { SHORT_MONTH_DATE_FORMAT } from '../data';

const NewAssignmentModalDropdown = ({
  id: courseKey, onClick: openAssignmentModal, courseRuns, children,
}) => {
  const [emptyState] = useState(courseRuns.length === 0);
  return (
    <Dropdown id={courseKey}>
      <Dropdown.Toggle variant="primary" id="assign-by-course-runs-dropdown">
        {children}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header>
          {emptyState ? 'No available dates' : 'By date'}
        </Dropdown.Header>
        {!emptyState && courseRuns.sort((a, b) => a.enrollBy - b.enrollBy).map(courseRun => (
          <Dropdown.Item key={courseRun.key} id={courseRun.key} onClick={openAssignmentModal}>
            <Stack>
              Enroll by {dayjs(courseRun.enrollBy).format(SHORT_MONTH_DATE_FORMAT)}
              <span className="small">Starts {dayjs(courseRun.starts).format(SHORT_MONTH_DATE_FORMAT)}</span>
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
  courseRuns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  children: PropTypes.node.isRequired,
};

export default NewAssignmentModalDropdown;
