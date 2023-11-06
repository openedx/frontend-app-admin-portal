import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Mail } from '@edx/paragon/icons';

const AssignmentTableRemindAction = ({ selectedFlatRows, ...rest }) => {
  const selectedRemindableRows = selectedFlatRows.filter(row => row.original.learnerState === 'waiting').length;
  return (
    <Button
      disabled={selectedRemindableRows === 0}
      iconBefore={Mail}
      // eslint-disable-next-line no-console
      onClick={() => console.log('Remind', selectedFlatRows, rest)}
    >
      {`Remind (${selectedRemindableRows})`}
    </Button>
  );
};

AssignmentTableRemindAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
};

AssignmentTableRemindAction.defaultProps = {
  selectedFlatRows: [],
};

export default AssignmentTableRemindAction;
