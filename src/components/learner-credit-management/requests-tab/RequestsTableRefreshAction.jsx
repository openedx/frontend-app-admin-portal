import { Button } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const RequestsTableRefreshAction = ({ tableInstance, refresh }) => {
  const handleRefresh = () => {
    const { state: dataTableState } = tableInstance;
    refresh(dataTableState);
  };

  return (
    <Button
      variant="outline-primary"
      onClick={handleRefresh}
    >
      <FormattedMessage
        id="learnerCreditManagement.budgetDetail.requestsTab.refresh"
        defaultMessage="Refresh"
        description="Button text to refresh the requests table"
      />
    </Button>
  );
};

RequestsTableRefreshAction.propTypes = {
  refresh: PropTypes.func.isRequired,
  tableInstance: PropTypes.shape({
    state: PropTypes.shape(),
  }),
};

RequestsTableRefreshAction.defaultProps = {
  tableInstance: { state: {} },
};

export default RequestsTableRefreshAction;
