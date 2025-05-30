import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';
import ActionCell from '../../SubsidyRequestManagementTable/ActionCell';
import RequestStatusCell from '../../SubsidyRequestManagementTable/RequestStatusCell';
import RequestDetailsCell from './RequestDetailsCell';
import CustomTableControlBar from './CustomTableControlBar';
import AmountCell from './AmountCell';

const RequestsTable = ({
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
        accessor: 'requestDetails',
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
      isSortable
      manualSortBy
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
          id: 'learnerCreditManagement.budgetDetail.requestsTab.noResults',
          defaultMessage: 'No results found',
          description: 'Message displayed when no results are found in the requests table.',
        })}
        />
      )}
      <DataTable.TableFooter />
    </DataTable>
  );
};

RequestsTable.propTypes = {
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

RequestsTable.defaultProps = {
  disableApproveButton: false,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(RequestsTable);
