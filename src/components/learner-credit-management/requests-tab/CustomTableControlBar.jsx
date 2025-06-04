import {
  Button, Col, DataTable, Row,
} from '@openedx/paragon';
import PropTypes from 'prop-types';

const CustomTableControlBar = ({
  onRefresh, isLoading, intl, ...props
}) => (
  <Row className="justify-content-between align-items-start">
    <Col className="flex-grow-1 mx-0">
      <DataTable.TableControlBar {...props} className="px-0" />
    </Col>
    <Col xs="auto" className="mt-2">
      <Button
        variant="outline-primary"
        onClick={onRefresh}
        disabled={isLoading}
        size="md"
        className="ml-2"
      >
        {intl.formatMessage({
          id: 'learnerCreditManagement.budgetDetail.requestsTab.refresh',
          defaultMessage: 'Refresh',
          description: 'Button text to refresh the requests table',
        })}
      </Button>
    </Col>
  </Row>
);

CustomTableControlBar.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default CustomTableControlBar;
