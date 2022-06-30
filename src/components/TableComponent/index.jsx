/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { Pagination, DataTable, Alert } from '@edx/paragon';
import { Error, WarningFilled } from '@edx/paragon/icons';
import 'font-awesome/css/font-awesome.css';

import TableLoadingSkeleton from './TableLoadingSkeleton';
import { updateUrl } from '../../utils';

const TableComponent = ({
  className, currentPage, pageCount, tableSortable, data, formatData, id, loading, enterpriseId, totalCount,
  paginateTable, clearTable, columns, error, sortTable,
}) => {
  const sortByColumn = useCallback(args => {
    const { sortBy } = args;
    if (sortBy && sortBy.length > 0) {
      const column = sortBy[0];
      const ordering = `${column.desc ? '-' : ''}${column.id}`;
      updateUrl({
        page: 1,
        ordering,
      });
      sortTable(ordering);
      sendEnterpriseTrackEvent(enterpriseId, 'edx.ui.enterprise.admin_portal.table.sorted', {
        tableId: id,
        column: column.id,
        direction: column.desc ? 'desc' : 'asc',
      });
    }
  }, []);

  useEffect(() => {
    // Get initial data
    paginateTable();
    return clearTable;
  }, []);

  const handlePageChange = (page) => {
    updateUrl({ page });
    sendEnterpriseTrackEvent(enterpriseId, 'edx.ui.enterprise.admin_portal.table.paginated', {
      tableId: id,
      page,
    });
    paginateTable(parseInt(page, 10));
  };

  const renderTableContent = () => (
    <div className={className}>
      <div className="row">
        <div className="col">
          <div className="table-responsive">
            <DataTable
              id={id}
              className="table-sm table-striped"
              columns={columns}
              data={formatData(data)}
              isSortable={tableSortable}
              itemCount={totalCount}
              isLoading={loading}
              manualSortBy
              fetchData={sortByColumn}
            >
              <DataTable.TableControlBar />
              <DataTable.Table />
              <DataTable.TableFooter>
                <div className="col d-flex justify-content-center">
                  <Pagination
                    paginationLabel={`${id}-pagination`}
                    pageCount={pageCount}
                    currentPage={currentPage}
                    onPageSelect={handlePageChange}
                  />
                </div>
              </DataTable.TableFooter>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoadingMessage = () => (
    <TableLoadingSkeleton />
  );

  const renderErrorMessage = () => (
    <Alert
      variant="danger"
      icon={Error}
    >
      <Alert.Heading>Unable to load data</Alert.Heading>
      <p>{`Try refreshing your screen (${error.message})`}</p>
    </Alert>
  );

  const renderEmptyDataMessage = () => (
    <Alert
      variant="warning"
      icon={WarningFilled}
    >
      There are no results.
    </Alert>
  );

  return (
    <>
      {error && renderErrorMessage()}
      {loading && !data && renderLoadingMessage()}
      {!loading && !error && data && data.length === 0
        && renderEmptyDataMessage()}
      {data && data.length > 0 && renderTableContent()}
    </>
  );
};

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
  totalCount: PropTypes.number,
  currentPage: PropTypes.number,
  pageCount: PropTypes.number,
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
  currentPage: undefined,
  pageCount: undefined,
  error: null,
  loading: false,
  totalCount: 0,
};

export default TableComponent;
