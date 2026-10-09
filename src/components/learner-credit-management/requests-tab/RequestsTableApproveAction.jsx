import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useApproveBnrRequests from '../data/hooks/useApproveBnrRequests';
import BulkApproveBnrRequestModal from './BulkApproveBnrRequestModal';
import { LEARNER_CREDIT_REQUEST_STATES, useBudgetId } from '../data';

const calculateTotalToApprove = ({
  requestUuids,
  isEntireTableSelected,
  requestStatusCounts,
}) => {
  if (isEntireTableSelected) {
    const requestedCounts = requestStatusCounts.filter(
      ({ learnerRequestState }) => learnerRequestState === LEARNER_CREDIT_REQUEST_STATES.requested,
    );
    return requestedCounts.length ? requestedCounts[0].count : 0;
  }
  return requestUuids.length;
};

const RequestsTableApproveAction = ({
  selectedFlatRows,
  isEntireTableSelected,
  requestStatusCounts,
  enterpriseId,
  onRefresh,
}) => {
  const { subsidyAccessPolicyId } = useBudgetId();

  // Filter to only include rows with 'requested' status
  const approvableRows = selectedFlatRows.filter(
    row => row.original.learnerRequestState === LEARNER_CREDIT_REQUEST_STATES.requested,
  );
  const requestUuids = approvableRows.map(row => row.original.uuid);

  const {
    approveButtonState,
    approveBnrRequests,
    close,
    isOpen,
    open,
  } = useApproveBnrRequests(
    enterpriseId,
    requestUuids,
  );

  const selectedApprovableRowCount = calculateTotalToApprove({
    requestUuids,
    isEntireTableSelected,
    requestStatusCounts,
  });

  return (
    <>
      <Button
        variant="primary"
        disabled={selectedApprovableRowCount === 0}
        iconBefore={Check}
        onClick={open}
      >
        <FormattedMessage
          id="lcm.budget.detail.page.requests.tab.approve.action"
          defaultMessage="Approve ({selectedApprovableRowCount})"
          description="Button text to approve selected requests"
          values={{ selectedApprovableRowCount }}
        />
      </Button>
      <BulkApproveBnrRequestModal
        approveBnrRequests={approveBnrRequests}
        close={close}
        isOpen={isOpen}
        approveButtonState={approveButtonState}
        requestCount={selectedApprovableRowCount}
        enterpriseId={enterpriseId}
        subsidyAccessPolicyId={subsidyAccessPolicyId}
        onRefresh={onRefresh}
      />
    </>
  );
};

RequestsTableApproveAction.defaultProps = {
  selectedFlatRows: [],
  isEntireTableSelected: false,
  requestStatusCounts: [],
  onRefresh: undefined,
};

RequestsTableApproveAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
  enterpriseId: PropTypes.string.isRequired,
  isEntireTableSelected: PropTypes.bool,
  requestStatusCounts: PropTypes.arrayOf(PropTypes.shape({
    learnerRequestState: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  })),
  onRefresh: PropTypes.func,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(RequestsTableApproveAction);
