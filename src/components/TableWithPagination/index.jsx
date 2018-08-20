import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { withRouter } from 'react-router';
import { Pagination, Table } from '@edx/paragon';
import { orderBy } from 'lodash';
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
      tableData: this.props.data,
    };

    this.handleTablePageSelect = this.handleTablePageSelect.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props;
    if (data !== prevProps.data) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        tableData: data,
      });
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
    const { pageCount } = this.props;
    const ordering = direction === 'asc' ? key : `-${key}`;
    const options = formatTableOptions({
      ordering,
      page_size: this.state.pageSize,
    });
    this.props.history.push(`?${qs.stringify(options)}`);
    this.setState({
      ordering,
    });
    if (pageCount > 1) {
      this.setState({
        currentPage: 1,
      });
      this.props.handleDataUpdate(options);
    } else {
      this.sortTableData({ key, direction });
    }
  }

  sortTableData({ key, direction }) {
    const { tableData } = this.state;
    // `parseKeyValue` adjusts the key's value into its appropriate data type to ensure
    // proper sorting and sort order (e.g., asc/desc). A numeric value (even if passed in
    // as a string) must be parsed as an actual numeric value. An empty value (e.g., null,
    // undefined) must be parsed as an empty string to ensure the empty values are forced
    // to the top in an ascending sort order.
    const parseKeyValue = (obj) => {
      const value = obj[key] ? obj[key].trim() : '';
      if (!Number.isNaN(value) && !Number.isNaN(parseFloat(value))) {
        return parseFloat(value);
      }
      return value;
    };
    const sortedTableData = orderBy(tableData, parseKeyValue, [direction]);
    this.setState({
      tableData: sortedTableData,
    });
  }

  render() {
    const {
      className,
      paginationLabel,
      pageCount,
      tableSortable,
      formatData,
    } = this.props;
    const {
      columns,
      currentPage,
      ordering,
      tableData,
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
                data={formatData(tableData)}
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
  formatData: PropTypes.func.isRequired,
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
