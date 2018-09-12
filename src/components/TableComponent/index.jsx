import React from 'react';
import PropTypes from 'prop-types';

import { Pagination, Table } from '@edx/paragon';
import 'font-awesome/css/font-awesome.css';

import LoadingMessage from '../LoadingMessage';
import StatusAlert from '../StatusAlert';
import './TableComponent.scss';

class TableComponent extends React.Component {
  componentDidMount() {
    // Get initial data
    this.props.paginateTable();
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
      paginateTable,
      sortTable,
      id,
    } = this.props;

    const columnConfig = this.props.columns.map(column => ({
      ...column,
      onSort: column.columnSortable ? (direction) => {
        sortTable({ key: column.key, direction });
      } : null,
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
            <div className="table-responsive">
              <Table
                id={id}
                className={['table-sm', 'table-striped']}
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
              onPageSelect={paginateTable}
            />
          </div>
        </div>
      </div>
    );
  }

  renderLoadingMessage() {
    return <LoadingMessage className="table-loading" />;
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        alertType="danger"
        iconClassName={['fa', 'fa-times-circle']}
        title="Unable to load full report"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderEmptyDataMessage() {
    return (
      <StatusAlert
        alertType="warning"
        iconClassName={['fa', 'fa-exclamation-circle']}
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
      <div>
        {error && this.renderErrorMessage()}
        {loading && !data && this.renderLoadingMessage()}
        {!loading && !error && data && data.length === 0 &&
          this.renderEmptyDataMessage()
        }
        {data && data.length > 0 && this.renderTableContent()}
      </div>
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
  data: PropTypes.arrayOf(PropTypes.shape({})),
  currentPage: PropTypes.number,
  pageCount: PropTypes.number,
  ordering: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  paginateTable: PropTypes.func.isRequired,
  sortTable: PropTypes.func.isRequired,
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
