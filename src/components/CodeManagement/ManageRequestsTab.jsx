import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import dayjs from 'dayjs';

import { Stack } from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';

import SubsidyRequestManagementTable, {
  useSubsidyRequests,
  PAGE_SIZE,
} from '../SubsidyRequestManagementTable';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';
import { ApproveCouponCodeRequestModal, DeclineSubsidyRequestModal } from '../subsidy-request-modals';
import { fetchCouponOrders } from '../../data/actions/coupons';
import LoadingMessage from '../LoadingMessage';
import { NoAvailableCodesBanner } from '../subsidy-request-management-alerts';
import { SUPPORTED_SUBSIDY_TYPES, SUBSIDY_REQUEST_STATUS } from '../../data/constants/subsidyRequests';
import { SubsidyRequestsContext } from '../subsidy-requests';

const ManageRequestsTab = ({
  enterpriseId, couponsData, loading: loadingCoupons, fetchCoupons,
}) => {
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const {
    isLoading,
    requests,
    requestsOverview,
    handleFetchRequests,
    updateRequestStatus,
  } = useSubsidyRequests(enterpriseId, SUPPORTED_SUBSIDY_TYPES.coupon);
  const { decrementCouponCodeRequestCount } = useContext(SubsidyRequestsContext);

  const [selectedRequest, setSelectedRequest] = useState();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);

  if (loadingCoupons) {
    return <LoadingMessage className="coupons mt-3" />;
  }

  const now = dayjs();
  const coupons = couponsData.results;
  const hasAvailableCodes = coupons.some(coupon => dayjs(coupon.endDate) > now && coupon.numUnassigned > 0);

  return (
    <Stack gap={2}>
      <div>
        <h2>Enrollment requests</h2>
        <p>Approve or decline enrollment requests for individual learners below.</p>
      </div>
      <NoAvailableCodesBanner coupons={coupons} />
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
        disableApproveButton={!hasAvailableCodes}
      />
      {selectedRequest && (
        <>
          {isApproveModalOpen && (
            <ApproveCouponCodeRequestModal
              isOpen
              couponCodeRequest={selectedRequest}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: SUBSIDY_REQUEST_STATUS.PENDING });
                decrementCouponCodeRequestCount();
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
                decrementCouponCodeRequestCount();
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

ManageRequestsTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  couponsData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape()),
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  fetchCoupons: PropTypes.func.isRequired,
};
const mapDispatchToProps = dispatch => ({
  fetchCoupons: (options) => {
    dispatch(fetchCouponOrders(options));
  },
});

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  loading: state.coupons.loading,
  couponsData: state.coupons.data ? camelCaseObject(state.coupons.data) : { results: [] },
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageRequestsTab);
