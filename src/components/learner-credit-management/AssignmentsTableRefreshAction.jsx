import React from 'react';
import { Button } from '@edx/paragon';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import EVENT_NAMES from '../../eventTracking';

const AssignmentsTableRefreshAction = ({ enterpriseId, tableInstance, refresh }) => {
  const handleRefresh = () => {
    const { state: dataTableState } = tableInstance;
    refresh(dataTableState);
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_DETAILS_ASSIGNED_DATATABLE_ACTIONS_REFRESH,
    );
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
  enterpriseId: PropTypes.string.isRequired,
  refresh: PropTypes.func.isRequired,
  tableInstance: PropTypes.shape({
    state: PropTypes.shape(),
  }),
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});
export default connect(mapStateToProps)(AssignmentsTableRefreshAction);
