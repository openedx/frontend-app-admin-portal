import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useDeclineBnrRequests from '../data/hooks/useDeclineBnrRequests';
import BulkDeclineBnrRequestModal from './BulkDeclineBnrRequestModal';
import { LEARNER_CREDIT_REQUEST_STATES } from '../data';

const calculateTotalToDecline = ({
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

const RequestsTableDeclineAction = ({
  selectedFlatRows,
  isEntireTableSelected,
  requestStatusCounts,
  enterpriseId,
}) => {
  // Filter to only include rows with 'requested' status
  const declinableRows = selectedFlatRows.filter(
    row => row.original.learnerRequestState === LEARNER_CREDIT_REQUEST_STATES.requested,
  );
  const requestUuids = declinableRows.map(row => row.original.uuid);

  const {
    declineButtonState,
    declineBnrRequests,
    close,
    isOpen,
    open,
  } = useDeclineBnrRequests(
    enterpriseId,
    requestUuids,
  );

  const selectedDeclinableRowCount = calculateTotalToDecline({
    requestUuids,
    isEntireTableSelected,
    requestStatusCounts,
  });

  return (
    <>
      <Button
        variant="outline-primary"
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
      />
    </>
  );
};

RequestsTableDeclineAction.defaultProps = {
  selectedFlatRows: [],
  isEntireTableSelected: false,
  requestStatusCounts: [],
};

RequestsTableDeclineAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
  enterpriseId: PropTypes.string.isRequired,
  isEntireTableSelected: PropTypes.bool,
  requestStatusCounts: PropTypes.arrayOf(PropTypes.shape({
    learnerRequestState: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  })),
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(RequestsTableDeclineAction);
