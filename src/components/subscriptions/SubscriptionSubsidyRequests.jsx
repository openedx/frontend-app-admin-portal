import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';
import { connect } from 'react-redux';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SubsidyRequestsContext } from '../subsidy-requests';
import SubsidyRequestManagementTable, {
  useSubsidyRequests,
  PAGE_SIZE,
} from '../SubsidyRequestManagementTable';
import { ApproveLicenseRequestModal, DeclineSubsidyRequestModal } from '../subsidy-request-modals';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';
import { NoAvailableLicensesBanner } from '../subsidy-request-management-alerts';
import { SubscriptionContext } from './SubscriptionData';
import LoadingMessage from '../LoadingMessage';
import { SUPPORTED_SUBSIDY_TYPES, SUBSIDY_REQUEST_STATUS } from '../../data/constants/subsidyRequests';

const SubscriptionSubsidyRequests = ({ enterpriseId }) => {
  const {
    isLoading,
    requests,
    requestsOverview,
    handleFetchRequests,
    updateRequestStatus,
  } = useSubsidyRequests(enterpriseId, SUPPORTED_SUBSIDY_TYPES.license);
  const { decrementLicenseRequestCount } = useContext(SubsidyRequestsContext);
  const { data: subscriptionsData, loading: isLoadingSubscriptions } = useContext(SubscriptionContext);

  const [selectedRequest, setSelectedRequest] = useState();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);

  if (isLoadingSubscriptions) {
    return <LoadingMessage className="subscriptions" />;
  }

  const subscriptions = subscriptionsData.results;

  const hasAvailableLicenses = subscriptions.some(
    subscription => subscription.licenses.unassigned > 0 && subscription.daysUntilExpiration > 0,
  );

  return (
    <Stack gap={2}>
      <div>
        <h2>
          <FormattedMessage
            id="admin.portal.manage.request.enrollment.requests.heading"
            defaultMessage="Enrollment requests"
            description="Heading for the enrollment requests section in the manage request tab."
          />
        </h2>
        <p>
          <FormattedMessage
            id="admin.portal.manage.request.enrollment.requests.description"
            defaultMessage="Approve or decline enrollment requests for individual learners below."
            description="Description for the enrollment requests section explaining the actions that can be taken."
          />
        </p>
      </div>
      <NoAvailableLicensesBanner subscriptions={subscriptions} />
      <SubsidyRequestManagementTable
        pageCount={requests.pageCount}
        itemCount={requests.itemCount}
        data={requests.requests}
        fetchData={handleFetchRequests}
        requestStatusFilterChoices={requestsOverview}
        onApprove={(row) => {
          setSelectedRequest(row);
          setIsApproveModalOpen(true);
        }}
        onDecline={(row) => {
          setSelectedRequest(row);
          setIsDenyModalOpen(true);
        }}
        isLoading={isLoading}
        initialTableOptions={{
          getRowId: row => row.uuid,
        }}
        initialState={{
          pageSize: PAGE_SIZE,
          pageIndex: 0,
        }}
        disableApproveButton={!hasAvailableLicenses}
      />
      {selectedRequest && (
        <>
          {isApproveModalOpen && (
            <ApproveLicenseRequestModal
              isOpen
              licenseRequest={selectedRequest}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: SUBSIDY_REQUEST_STATUS.PENDING });
                decrementLicenseRequestCount();
                setIsApproveModalOpen(false);
              }}
              onClose={() => setIsApproveModalOpen(false)}
            />
          )}
          {isDenyModalOpen && (
            <DeclineSubsidyRequestModal
              isOpen
              subsidyRequest={selectedRequest}
              declineRequestFn={EnterpriseAccessApiService.declineLicenseRequests}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: SUBSIDY_REQUEST_STATUS.DECLINED });
                decrementLicenseRequestCount();
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

SubscriptionSubsidyRequests.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SubscriptionSubsidyRequests);
