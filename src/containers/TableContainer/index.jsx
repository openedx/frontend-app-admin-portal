import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import TableComponent from '../../components/TableComponent';
import { paginateTable, sortTable, clearTable } from '../../data/actions/table';

const mapStateToProps = (state, ownProps) => {
  const tableState = state.table[ownProps.id] || {};
  return {
    data: tableState.data && tableState.data.results,
    currentPage: tableState.data && tableState.data.current_page,
    pageCount: tableState.data && tableState.data.num_pages,
    ordering: tableState.ordering,
    loading: tableState.loading,
    error: tableState.error,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  paginateTable: (pageNumber) => {
    dispatch(paginateTable(ownProps.id, ownProps.fetchMethod, pageNumber));
  },
  sortTable: (ordering) => {
    dispatch(sortTable(ownProps.id, ownProps.fetchMethod, ordering));
  },
  clearTable: () => {
    dispatch(clearTable(ownProps.id));
  },
});

const TableContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(TableComponent);

export default withRouter(TableContainer);
