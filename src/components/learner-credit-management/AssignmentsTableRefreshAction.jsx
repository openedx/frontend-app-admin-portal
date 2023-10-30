import React from 'react';
import { Button } from '@edx/paragon';
import PropTypes from 'prop-types';

const AssignmentsTableRefreshAction = ({ tableInstance, refresh }) => {
  const { state } = tableInstance;

  const handleRefresh = () => {
    const {
      pageIndex,
      pageSize,
      sortBy,
      filters,
    } = state;
    const dataTableArgs = {
      pageIndex,
      pageSize,
      sortBy,
      filters,
    };
    refresh(dataTableArgs);
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
    state: PropTypes.shape({
      pageIndex: PropTypes.number,
      pageSize: PropTypes.number,
      sortBy: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        desc: PropTypes.bool,
      })),
      filters: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        value: PropTypes.string,
      })),
    }),
  }),
};

export default AssignmentsTableRefreshAction;
