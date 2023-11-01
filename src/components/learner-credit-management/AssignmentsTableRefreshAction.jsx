import React from 'react';
import { Button } from '@edx/paragon';
import PropTypes from 'prop-types';

const AssignmentsTableRefreshAction = ({ tableInstance, refresh }) => {
  const handleRefresh = () => {
    const { state: dataTableState } = tableInstance;
    refresh(dataTableState);
  };

  return (
    <Button
      variant="outline-primary"
      onClick={handleRefresh}
    >
      Refresh
    </Button>
  );
};

AssignmentsTableRefreshAction.propTypes = {
  refresh: PropTypes.func.isRequired,
  tableInstance: PropTypes.shape({
    state: PropTypes.shape(),
  }),
};

export default AssignmentsTableRefreshAction;
