import { useState } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';

import BNRRequestsTable from './requests-tab/BNRRequestsTable';
import { SUBSIDY_REQUEST_STATUS } from '../../data/constants/subsidyRequests';
import useBnrSubsidyRequests from './requests-tab/data/hooks/useBnrSubsidyRequests';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';
import { ApproveCouponCodeRequestModal, DeclineSubsidyRequestModal } from '../subsidy-request-modals';

const PAGE_SIZE = 20;

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
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  return (
    <Stack gap={2}>
      <div>
        <h2>Requests</h2>
        <p>Approve or decline requests for learners.</p>
      </div>
      <BNRRequestsTable
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
          setIsDenyModalOpen(true);
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
          {isDenyModalOpen && (
            <DeclineSubsidyRequestModal
              isOpen
              subsidyRequest={selectedRequest}
              declineRequestFn={EnterpriseAccessApiService.declineCouponCodeRequests}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: SUBSIDY_REQUEST_STATUS.DECLINED });
                setIsDenyModalOpen(false);
              }}
              onClose={() => setIsDenyModalOpen(false)}
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

export default BudgetDetailRequestsTabContent;
