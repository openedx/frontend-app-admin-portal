import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  CheckboxFilter,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';
import ActionCell from '../../SubsidyRequestManagementTable/ActionCell';
import RequestDetailsCell from './RequestDetailsCell';
// CustomTableControlBar removed - using tableActions instead
import AmountCell from './AmountCell';
import BnrRequestStatusCell from './BnrRequestStatusCell';
import TableTextFilter from '../TableTextFilter';
import { transformLearnerRequestStateCounts } from '../data/utils';
import RequestsTableApproveAction from './RequestsTableApproveAction';
import RequestsTableRefreshAction from './RequestsTableRefreshAction';

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
};

const RequestsTable = ({
  onApprove,
  onDecline,
  data,
  fetchData,
  tableData,
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
        accessor: 'requestDetails',
        Filter: TableTextFilter,
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
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: (props) => <AmountCell {...props} />,
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
          id: 'lcm.budget.detail.page.requests.table.columns.status',
          defaultMessage: 'Status',
          description: 'Column header for the status column in the requests table',
        }),
        accessor: 'learnerRequestState',
        Cell: BnrRequestStatusCell,
        Filter: CheckboxFilter,
        filter: 'includesValue',
        filterChoices: transformLearnerRequestStateCounts(tableData?.requestStatusCounts || []),
      },
    ]),
    [tableData?.requestStatusCounts, intl, enterpriseSlug],
  );
  return (
    <DataTable
      isFilterable
      manualFilters
      // Temporarily disabling sorting for release
      isSortable={false}
      manualSortBy
      isPaginated
      manualPagination
      isSelectable
      manualSelectColumn={selectColumn}
      SelectionStatusComponent={DataTable.ControlledSelectionStatus}
      defaultColumnValues={{ Filter: TableTextFilter }}
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
      bulkActions={[
        <RequestsTableApproveAction onRefresh={onRefresh} />,
      ]}
      tableActions={[
        <RequestsTableRefreshAction refresh={onRefresh} />,
      ]}
      initialTableOptions={initialTableOptions}
      initialState={initialState}
      {...rest}
    />
  );
};

RequestsTable.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  fetchData: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  pageCount: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
    email: PropTypes.string,
    courseTitle: PropTypes.string,
    courseId: PropTypes.string,
    amount: PropTypes.number,
    requestDate: PropTypes.string,
    learnerRequestState: PropTypes.string,
  })),
  tableData: PropTypes.shape({
    requestStatusCounts: PropTypes.arrayOf(PropTypes.shape({
      learnerRequestState: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })),
  }),
  onApprove: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  initialTableOptions: PropTypes.shape().isRequired,
  initialState: PropTypes.shape().isRequired,
  disableApproveButton: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
};

RequestsTable.defaultProps = {
  disableApproveButton: false,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(RequestsTable);
