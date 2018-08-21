import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { withRouter } from 'react-router';
import { Pagination, Table } from '@edx/paragon';
import 'font-awesome/css/font-awesome.css';

import { formatTableOptions } from '../../utils';

import './TableWithPagination.scss';

class TableWithPagination extends React.Component {
  constructor(props) {
    super(props);

    const { columns, location } = props;
    const queryParams = formatTableOptions(qs.parse(location.search));

    this.state = {
      columns: this.getTableColumns(columns),
      currentPage: queryParams.page,
      pageSize: queryParams.page_size,
      ordering: queryParams.ordering,
    };

    this.handleTablePageSelect = this.handleTablePageSelect.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { handleDataUpdate, location } = this.props;
    if (location !== prevProps.location) {
      const options = formatTableOptions(qs.parse(location.search));
      handleDataUpdate(options);
    }
  }

  getTableColumns(columns) {
    return columns.map(column => ({
      ...column,
      onSort: column.columnSortable ? (direction) => {
        this.handleSortTableColumn({ key: column.key, direction });
      } : null,
    }));
  }

  handleTablePageSelect(page) {
    const { pageSize, ordering } = this.state;
    const options = formatTableOptions({
      page: page !== 1 ? page : null,
      page_size: pageSize,
      ordering,
    });
    this.props.history.push(`?${qs.stringify(options)}`);
    this.setState({
      currentPage: page,
    });
    this.props.handleDataUpdate(options);
  }

  handleSortTableColumn({ key, direction }) {
    const ordering = direction === 'asc' ? key : `-${key}`;
    const options = formatTableOptions({
      ordering,
      page_size: this.state.pageSize,
    });
    this.props.history.push(`?${qs.stringify(options)}`);
    this.setState({
      ordering,
      currentPage: 1,
    });
    this.props.handleDataUpdate(options);
  }

  render() {
    const {
      className,
      data,
      paginationLabel,
      pageCount,
      tableSortable,
    } = this.props;
    const {
      columns,
      currentPage,
      ordering,
    } = this.state;

    let sortDirection;
    let sortColumn;

    if (tableSortable) {
      sortDirection = ordering && ordering.indexOf('-') !== -1 ? 'desc' : 'asc';
      sortColumn = (ordering && ordering.replace('-', '')) || columns[0].key;
    }

    return (
      <div className={className}>
        <div className="row">
          <div className="col">
            <div className="table-responsive">
              <Table
                className={['table-sm', 'table-striped']}
                columns={columns}
                data={data}
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
              paginationLabel={paginationLabel}
              pageCount={pageCount}
              currentPage={currentPage}
              onPageSelect={this.handleTablePageSelect}
            />
          </div>
        </div>
      </div>
    );
  }
}

TableWithPagination.defaultProps = {
  location: {
    search: null,
  },
  history: {},
  className: null,
  tableSortable: false,
};

TableWithPagination.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  pageCount: PropTypes.number.isRequired,
  paginationLabel: PropTypes.string.isRequired,
  handleDataUpdate: PropTypes.func.isRequired,
  className: PropTypes.string,
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  tableSortable: PropTypes.bool,
};

export default withRouter(TableWithPagination);
