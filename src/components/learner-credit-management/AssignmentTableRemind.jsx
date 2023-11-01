import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Mail } from '@edx/paragon/icons';

const AssignmentTableRemindAction = ({ selectedFlatRows, ...rest }) => {
  const hideRemindAction = selectedFlatRows.some(
    row => row.original.state !== 'allocated',
  );
  if (hideRemindAction) {
    return null;
  }
  return (
    // eslint-disable-next-line no-console
    <Button iconBefore={Mail} onClick={() => console.log('Remind', selectedFlatRows, rest)}>
      {`Remind (${selectedFlatRows.length})`}
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
