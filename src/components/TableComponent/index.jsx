import React from 'react';
import PropTypes from 'prop-types';

import { Pagination, Table } from '@edx/paragon';

import 'font-awesome/css/font-awesome.css';
import './TableComponent.scss';

class TableComponent extends React.Component {
  componentDidMount() {
    // Get initial data
    this.props.paginateTable();
  }

  render() {
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

    // Do not render until we've fetched data
    if (!data) {
      return null;
    }

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
}

TableComponent.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  ordering: PropTypes.string,
  id: PropTypes.string.isRequired,
  formatData: PropTypes.func.isRequired,
  paginateTable: PropTypes.func.isRequired,
  sortTable: PropTypes.func.isRequired,
  className: PropTypes.string,
  tableSortable: PropTypes.bool,
  currentPage: PropTypes.number,
  pageCount: PropTypes.number,
};

TableComponent.defaultProps = {
  className: null,
  tableSortable: false,
  data: undefined,
  ordering: undefined,
  currentPage: undefined,
  pageCount: undefined,
};

export default TableComponent;
