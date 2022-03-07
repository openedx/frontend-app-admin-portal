import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack } from '@edx/paragon';

import SubsidyRequestManagementTable, {
  useSubsidyRequests,
} from '../SubsidyRequestManagementTable';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';

export const PAGE_SIZE = 20;
export const DEBOUNCE_TIME_MS = 200;

const ManageRequestsTab = ({ enterpriseId }) => {
  const {
    isLoading,
    requests,
    requestsOverview,
    handleFetchRequests,
  } = useSubsidyRequests(
    enterpriseId,
    EnterpriseAccessApiService.getCouponCodeRequestOverview,
    EnterpriseAccessApiService.getCouponCodeRequests,
  );

  const handleApprove = (row) => console.log('approve', row);
  const handleDecline = (row) => console.log('decline', row);

  return (
    <Stack gap={2}>
      <div>
        <h2>Enrollment requests</h2>
        <p>Approve or decline enrollment requests for individual learners below.</p>
      </div>
      <SubsidyRequestManagementTable
        pageCount={requests.pageCount}
        itemCount={requests.itemCount}
        data={requests.requests}
        fetchData={handleFetchRequests}
        requestStatusFilterChoices={requestsOverview}
        onApprove={handleApprove}
        onDecline={handleDecline}
        isLoading={isLoading}
        initialTableOptions={{
          getRowId: row => row.uuid,
        }}
        initialState={{
          pageSize: PAGE_SIZE,
          pageIndex: 0,
        }}
      />
    </Stack>
  );
};

ManageRequestsTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ManageRequestsTab);
