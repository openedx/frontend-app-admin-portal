import { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  Button,
  Row,
  Col,
  Hyperlink,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { connect } from 'react-redux';
import ActionCell from '../../SubsidyRequestManagementTable/ActionCell';
import RequestStatusCell from '../../SubsidyRequestManagementTable/RequestStatusCell';

// Custom cell component for Request Details
const RequestDetailsCell = ({ row, enterpriseSlug }) => {
  const { email, courseTitle, courseId } = row.original;
  const { config: { ENTERPRISE_LEARNER_PORTAL_URL } } = useContext(AppContext);
  const linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${courseId}`;
  return (
    <div>
      <div className="font-weight-bold text-primary">
        {email}
      </div>
      <div className="small">
        <Hyperlink
          className="decoration-none"
          data-testid="course-link"
          href={linkToCourse}
          target="_blank"
          rel="noopener noreferrer"
        >
          {courseTitle}
        </Hyperlink>
      </div>
    </div>
  );
};

RequestDetailsCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      email: PropTypes.string.isRequired,
      courseTitle: PropTypes.string.isRequired,
      courseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

// Custom TableControlBar component with Refresh button
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

const BNRRequestsTable = ({
  onApprove,
  onDecline,
  data,
  fetchData,
  requestStatusFilterChoices,
  isLoading,
  pageCount,
  itemCount,
  initialTableOptions,
  initialState,
  disableApproveButton,
  onRefresh,
  enterpriseSlug,
  ...rest
}) => {
  const intl = useIntl();
  const columns = useMemo(
    () => ([
      {
        Header: intl.formatMessage({
          id: 'learnerCreditManagement.budgetDetail.requestsTab.columns.requestDetails',
          defaultMessage: 'Request details',
          description: 'Header for the request details column in the requests table',
        }),
        accessor: 'email',
        Filter: TextFilter,
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: (props) => <RequestDetailsCell {...props} enterpriseSlug={enterpriseSlug} />,
      },
      {
        Header: intl.formatMessage({
          id: 'learnerCreditManagement.budgetDetail.requestsTab.columns.amount',
          defaultMessage: 'Amount',
          description: 'Header for the amount column in the requests table',
        }),
        accessor: 'amount',
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'learnerCreditManagement.budgetDetail.requestsTab.columns.requestDate',
          defaultMessage: 'Request date',
          description: 'Header for the request date column in the requests table',
        }),
        accessor: 'requestDate',
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'admin.portal.subsidy.request.management.table.request.status.header',
          defaultMessage: 'Request status',
          description: 'Header for the request status column in the subsidy request management table.',
        }),
        accessor: 'requestStatus',
        Cell: RequestStatusCell,
        Filter: CheckboxFilter,
        filter: 'includesValue',
        filterChoices: requestStatusFilterChoices,
      },
    ]),
    [requestStatusFilterChoices, intl, enterpriseSlug],
  );

  return (
    <DataTable
      isFilterable
      manualFilters
      isPaginated
      manualPagination
      defaultColumnValues={{ Filter: TextFilter }}
      itemCount={itemCount}
      pageCount={pageCount}
      fetchData={fetchData}
      isLoading={isLoading}
      data={data}
      columns={columns}
      additionalColumns={[{
        id: 'action',
        Header: '',
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: (props) => (
          <ActionCell
            {...props}
            onApprove={onApprove}
            onDecline={onDecline}
            disableApproveButton={disableApproveButton}
          />
        ),
      }]}
      initialTableOptions={initialTableOptions}
      initialState={initialState}
      {...rest}
    >
      <CustomTableControlBar
        onRefresh={onRefresh}
        isLoading={isLoading}
        intl={intl}
      />
      <DataTable.Table />
      {!isLoading && (
        <DataTable.EmptyTable content={intl.formatMessage({
          id: 'admin.portal.subsidy.request.management.table.empty.table.message',
          defaultMessage: 'No results found',
          description: 'Message displayed when no results are found in the subsidy request management table.',
        })}
        />
      )}
      <DataTable.TableFooter />
    </DataTable>
  );
};

BNRRequestsTable.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  fetchData: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  pageCount: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  data: PropTypes.arrayOf(),
  requestStatusFilterChoices: PropTypes.arrayOf(PropTypes.shape({
    number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  onApprove: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  initialTableOptions: PropTypes.shape().isRequired,
  initialState: PropTypes.shape().isRequired,
  disableApproveButton: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
};

BNRRequestsTable.defaultProps = {
  disableApproveButton: false,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(BNRRequestsTable);
