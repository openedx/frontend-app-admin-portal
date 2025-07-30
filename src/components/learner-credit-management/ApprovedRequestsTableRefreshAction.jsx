import React from 'react';
import { Button } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const ApprovedRequestsTableRefreshAction = ({ refresh }) => {
  const handleRefresh = () => {
    refresh();
  };

  return (
    <Button
      variant="outline-primary"
      onClick={handleRefresh}
    >
      <FormattedMessage
        id="lcm.budget.detail.page.approved.requests.refresh"
        defaultMessage="Refresh"
        description="Button text to refresh the approved requests table"
      />
    </Button>
  );
};

ApprovedRequestsTableRefreshAction.propTypes = {
  refresh: PropTypes.func.isRequired,
};

export default ApprovedRequestsTableRefreshAction;
