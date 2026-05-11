import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useBulkDeclineBnrRequests from '../data/hooks/useBulkDeclineBnrRequests';
import BulkDeclineBnrRequestModal from './BulkDeclineBnrRequestModal';
import { LEARNER_CREDIT_REQUEST_STATES } from '../data';

const calculateTotalToDecline = ({
  requestUuids,
  isEntireTableSelected,
  requestStatusCounts,
}) => {
  if (isEntireTableSelected) {
    return requestStatusCounts.reduce(
      (acc, { learnerRequestState, count }) => (
        learnerRequestState === LEARNER_CREDIT_REQUEST_STATES.requested ? count + acc : acc
      ),
      0,
    );
  }
  return requestUuids.length;
};

const RequestsTableDeclineAction = ({
  selectedFlatRows,
  isEntireTableSelected,
  requestStatusCounts,
  enterpriseId,
  onRefresh,
}) => {
  // Only requests in 'requested' state are declinable
  const declinableRows = selectedFlatRows.filter(
    (row) => row.original.learnerRequestState
      === LEARNER_CREDIT_REQUEST_STATES.requested,
  );
  const requestUuids = declinableRows.map((row) => row.original.uuid);

  const {
    declineButtonState, declineBnrRequests, close, isOpen, open,
  } = useBulkDeclineBnrRequests(enterpriseId, requestUuids, isEntireTableSelected);

  const selectedDeclinableRowCount = calculateTotalToDecline({
    requestUuids,
    isEntireTableSelected,
    requestStatusCounts,
  });

  return (
    <>
      <Button
        variant="danger"
        disabled={selectedDeclinableRowCount === 0}
        iconBefore={DoNotDisturbOn}
        onClick={open}
      >
        <FormattedMessage
          id="lcm.budget.detail.page.requests.tab.decline.action"
          defaultMessage="Decline ({selectedDeclinableRowCount})"
          description="Button text to decline selected requests"
          values={{ selectedDeclinableRowCount }}
        />
      </Button>
      <BulkDeclineBnrRequestModal
        declineBnrRequests={declineBnrRequests}
        close={close}
        isOpen={isOpen}
        declineButtonState={declineButtonState}
        requestCount={selectedDeclinableRowCount}
        onRefresh={onRefresh}
      />
    </>
  );
};

RequestsTableDeclineAction.defaultProps = {
  selectedFlatRows: [],
  isEntireTableSelected: false,
  requestStatusCounts: [],
  onRefresh: undefined,
};

RequestsTableDeclineAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
  enterpriseId: PropTypes.string.isRequired,
  isEntireTableSelected: PropTypes.bool,
  requestStatusCounts: PropTypes.arrayOf(
    PropTypes.shape({
      learnerRequestState: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ),
  onRefresh: PropTypes.func,
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(RequestsTableDeclineAction);
