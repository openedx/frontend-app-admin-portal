import { useState } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';

import { connect } from 'react-redux';
import { SUBSIDY_REQUEST_STATUS } from '../../data/constants/subsidyRequests';
import useBnrSubsidyRequests from './requests-tab/data/hooks/useBnrSubsidyRequests';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';
import { ApproveCouponCodeRequestModal, DeclineSubsidyRequestModal } from '../subsidy-request-modals';
import { PAGE_SIZE } from './requests-tab/data/constants';
import RequestsTable from './requests-tab/RequestsTable';

const BudgetDetailRequestsTabContent = ({ enterpriseId }) => {
  const {
    isLoading,
    bnrRequests,
    requestsOverview,
    fetchBnrRequests,
    updateRequestStatus,
    refreshRequests,
  } = useBnrSubsidyRequests(enterpriseId);
  const [selectedRequest, setSelectedRequest] = useState();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  return (
    <Stack gap={2}>
      <div>
        <h3>Requests</h3>
        <p className="small">Approve or decline requests for learners.</p>
      </div>
      <RequestsTable
        pageCount={bnrRequests.pageCount}
        itemCount={bnrRequests.itemCount}
        data={bnrRequests.results}
        fetchData={fetchBnrRequests}
        requestStatusFilterChoices={requestsOverview}
        onApprove={(row) => {
          setSelectedRequest(row);
          setIsApproveModalOpen(true);
        }}
        onDecline={(row) => {
          setSelectedRequest(row);
          setIsDeclineModalOpen(true);
        }}
        onRefresh={refreshRequests}
        isLoading={isLoading}
        initialTableOptions={{
          getRowId: row => row.uuid,
        }}
        initialState={{
          pageSize: PAGE_SIZE,
          pageIndex: 0,
        }}
      />
      {selectedRequest && (
        <>
          {isApproveModalOpen && (
            <ApproveCouponCodeRequestModal
              isOpen
              couponCodeRequest={selectedRequest}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: SUBSIDY_REQUEST_STATUS.PENDING });
                setIsApproveModalOpen(false);
              }}
              onClose={() => setIsApproveModalOpen(false)}
            />
          )}
          {isDeclineModalOpen && (
            <DeclineSubsidyRequestModal
              isOpen
              subsidyRequest={selectedRequest}
              declineRequestFn={EnterpriseAccessApiService.declineCouponCodeRequests}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: SUBSIDY_REQUEST_STATUS.DECLINED });
                setIsDeclineModalOpen(false);
              }}
              onClose={() => setIsDeclineModalOpen(false)}
            />
          )}
        </>
      )}
    </Stack>
  );
};

BudgetDetailRequestsTabContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BudgetDetailRequestsTabContent);
