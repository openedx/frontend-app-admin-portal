import React from 'react';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { Pagination, DataTable, Alert } from '@edx/paragon';
import { Error, WarningFilled } from '@edx/paragon/icons';
import 'font-awesome/css/font-awesome.css';

import TableLoadingSkeleton from './TableLoadingSkeleton';
import TableLoadingOverlay from '../TableLoadingOverlay';
import { updateUrl } from '../../utils';

class TableComponent extends React.Component {
  componentDidMount() {
    // Get initial data
    this.props.paginateTable();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    // Handle the case where the query params have changed. This is used when sorting & paging, but
    // also when the back button is used. We need to determine if this is a pagination or sorting
    // request as we handle these as slightly different actions in the action handlers.
    if (location.search !== prevProps.location.search) {
      const prevQueryParams = new URLSearchParams(prevProps.location.search);
      const prevPage = prevQueryParams.get('page');
      const prevOrdering = prevQueryParams.get('ordering');
      const currentQueryParams = new URLSearchParams(location.search);
      const page = currentQueryParams.get('page');
      const ordering = currentQueryParams.get('ordering');
      if (ordering !== prevOrdering) {
        this.props.sortTable(ordering);
      } else if (page !== prevPage) {
        this.props.paginateTable(parseInt(page, 10));
      }
    }
  }

  componentWillUnmount() {
    this.props.clearTable();
  }

  renderTableContent() {
    const {
      className,
      currentPage,
      pageCount,
      tableSortable,
      data,
      ordering,
      formatData,
      id,
      loading,
      enterpriseId,
    } = this.props;

    const sortByColumn = (column, direction) => {
      updateUrl({
        page: 1,
        ordering: direction === 'desc' ? `-${column.key}` : column.key,
      });
      sendEnterpriseTrackEvent(enterpriseId, 'edx.ui.enterprise.admin_portal.table.sorted', {
        tableId: id,
        column: column.label,
        direction,
      });
    };

    const columnConfig = this.props.columns.map(column => ({
      ...column,
      onSort: column.columnSortable ? (direction) => sortByColumn(column, direction) : null,
    }));

    let sortDirection;
    let sortColumn;

    if (tableSortable) {
      sortDirection = ordering && ordering.indexOf('-') !== -1 ? 'desc' : 'asc';
      sortColumn = (ordering && ordering.replace('-', '')) || columnConfig[0].key;
    }

    return (
      <div className={className}>
        <div className="row">
          <div className="col">
            {loading && <TableLoadingOverlay />}
            <div className="table-responsive">
              <DataTable
                id={id}
                className="table-sm table-striped"
                columns={columnConfig}
                data={formatData(data)}
                tableSortable={tableSortable}
                defaultSortedColumn={sortColumn}
                defaultSortDirection={sortDirection}
                itemCount={data.length}
              />
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col d-flex justify-content-center">
            <Pagination
              paginationLabel={`${id}-pagination`}
              pageCount={pageCount}
              currentPage={currentPage}
              onPageSelect={(page) => {
                updateUrl({ page });
                sendEnterpriseTrackEvent(enterpriseId, 'edx.ui.enterprise.admin_portal.table.paginated', {
                  tableId: id,
                  page,
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  renderLoadingMessage() {
    return <TableLoadingSkeleton />;
  }

  renderErrorMessage() {
    return (
      <Alert
        variant="danger"
        icon={Error}
      >
        <Alert.Heading>Unable to load data</Alert.Heading>
        <p>{`Try refreshing your screen (${this.props.error.message})`}</p>
      </Alert>
    );
  }

  renderEmptyDataMessage() {
    return (
      <Alert
        variant="warning"
        icon={WarningFilled}
      >
        There are no results.
      </Alert>
    );
  }

  render() {
    const {
      data,
      loading,
      error,
    } = this.props;

    return (
      <>
        {error && this.renderErrorMessage()}
        {loading && !data && this.renderLoadingMessage()}
        {!loading && !error && data && data.length === 0
          && this.renderEmptyDataMessage()}
        {data && data.length > 0 && this.renderTableContent()}
      </>
    );
  }
}

TableComponent.propTypes = {
  // Props expected from consumer
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  formatData: PropTypes.func.isRequired,
  tableSortable: PropTypes.bool,

  // Props expected from TableContainer / redux store
  enterpriseId: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  currentPage: PropTypes.number,
  pageCount: PropTypes.number,
  ordering: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  paginateTable: PropTypes.func.isRequired,
  sortTable: PropTypes.func.isRequired,
  clearTable: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
};

TableComponent.defaultProps = {
  className: null,
  tableSortable: false,
  data: undefined,
  ordering: undefined,
  currentPage: undefined,
  pageCount: undefined,
  error: null,
  loading: false,
};

export default TableComponent;
