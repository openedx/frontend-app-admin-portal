import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  CheckboxFilter,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import ActionCell from '../../SubsidyRequestManagementTable/ActionCell';
import RequestStatusTableCell from '../RequestStatusTableCell';
import RequestDetailsTableCell from '../RequestDetailsTableCell';
import CustomTableControlBar from './CustomTableControlBar';
import RequestAmountTableCell from '../RequestAmountTableCell';
import TableTextFilter from '../TableTextFilter';
import CustomDataTableEmptyState from '../CustomDataTableEmptyState';
import { DEFAULT_PAGE, PAGE_SIZE } from '../data';

const FilterStatus = (rest) => (
  <DataTable.FilterStatus showFilteredFields={false} {...rest} />
);

const RequestsTable = ({
  onApprove,
  onDecline,
  data,
  fetchData,
  requestStatusFilterChoices,
  isLoading,
  pageCount,
  itemCount,
  disableApproveButton,
  onRefresh,
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
        Cell: RequestDetailsTableCell,
        disableSortBy: true,
      },
      {
        Header: intl.formatMessage({
          id: 'learnerCreditManagement.budgetDetail.requestsTab.columns.amount',
          defaultMessage: 'Amount',
          description: 'Header for the amount column in the requests table',
        }),
        accessor: 'amount',
        Cell: RequestAmountTableCell,
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
        Cell: RequestStatusTableCell,
        Filter: CheckboxFilter,
        filter: 'includesValue',
        filterChoices: requestStatusFilterChoices,
      },
    ]),
    [requestStatusFilterChoices, intl],
  );

  return (
    <DataTable
      isSortable
      manualSortBy
      isPaginated
      manualPagination
      isFilterable
      manualFilters
      isLoading={isLoading}
      defaultColumnValues={{ Filter: TableTextFilter }}
      FilterStatusComponent={FilterStatus}
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
      initialTableOptions={{
        getRowId: (row) => row?.uuid?.toString(),
      }}
      initialState={{
        pageSize: PAGE_SIZE,
        pageIndex: DEFAULT_PAGE,
        sortBy: [
          {
            id: 'requestDate',
            desc: true,
          },
        ],
        filters: [],
      }}
      fetchData={fetchData}
      data={data}
      itemCount={itemCount}
      pageCount={pageCount}
      EmptyTableComponent={CustomDataTableEmptyState}
    >
      <CustomTableControlBar
        onRefresh={onRefresh}
        isLoading={isLoading}
        intl={intl}
      />
      <DataTable.Table />

      <DataTable.TableFooter />
    </DataTable>
  );
};

RequestsTable.propTypes = {
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
    requestStatus: PropTypes.string,
  })),
  requestStatusFilterChoices: PropTypes.arrayOf(PropTypes.shape({
    number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  onApprove: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  disableApproveButton: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
};

RequestsTable.defaultProps = {
  disableApproveButton: false,
};

export default RequestsTable;
