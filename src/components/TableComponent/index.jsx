import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { Pagination, Table } from '@edx/paragon';
import 'font-awesome/css/font-awesome.css';

import TableLoadingSkeleton from './TableLoadingSkeleton';
import TableLoadingOverlay from '../TableLoadingOverlay';
import StatusAlert from '../StatusAlert';
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
      const { page: prevPage, ordering: prevOrdering } = qs.parse(prevProps.location.search);
      const { page, ordering } = qs.parse(location.search);
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
              <Table
                id={id}
                className="table-sm table-striped"
                columns={columnConfig}
                data={formatData(data)}
                tableSortable={tableSortable}
                defaultSortedColumn={sortColumn}
                defaultSortDirection={sortDirection}
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
      <StatusAlert
        alertType="danger"
        iconClassName="fa fa-times-circle"
        title="Unable to load data"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderEmptyDataMessage() {
    return (
      <StatusAlert
        alertType="warning"
        iconClassName="fa fa-exclamation-circle"
        message="There are no results."
      />
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
