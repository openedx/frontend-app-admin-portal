import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';

const AssignmentTableCancelAction = ({ selectedFlatRows, ...rest }) => (
  // eslint-disable-next-line no-console
  <Button variant="danger" iconBefore={DoNotDisturbOn} onClick={() => console.log('Cancel', selectedFlatRows, rest)}>
    {`Cancel (${selectedFlatRows.length})`}
  </Button>
);

AssignmentTableCancelAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
};

AssignmentTableCancelAction.defaultProps = {
  selectedFlatRows: [],
};

export default AssignmentTableCancelAction;
