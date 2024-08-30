import React, { useState, useCallback } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { DataTable, TablePaginationMinimal } from '@openedx/paragon';
import Header from '../Header';
import { analyticsDataTableKeys } from '../data/constants';

import { useEnterpriseAnalyticsData, usePaginatedData } from '../data/hooks';

const AnalyticsTable = ({
  name,
  tableColumns,
  tableTitle,
  tableSubtitle,
  enableCSVDownload,
  startDate,
  endDate,
  enterpriseId,
}) => {
  const intl = useIntl();
  const [currentPage, setCurrentPage] = useState(0);

  const {
    isLoading, data, isPreviousData,
  } = useEnterpriseAnalyticsData({
    enterpriseCustomerUUID: enterpriseId,
    key: analyticsDataTableKeys[name],
    startDate,
    endDate,
    // pages index from 1 in backend, frontend components index from 0
    currentPage: currentPage + 1,
  });

  const fetchData = useCallback(
    (args) => {
      if (args.pageIndex !== currentPage) {
        setCurrentPage(args.pageIndex);
      }
    },
    [currentPage],
  );

  const paginatedData = usePaginatedData(data);

  return (
    <div className="analytics-data-table mt-4">
      <div className="analytics-datatable-container mb-4">
        <Header
          title={tableTitle}
          subtitle={tableSubtitle}
          startDate={startDate}
          endDate={endDate}
          activeTab={name}
          enterpriseId={enterpriseId}
          isDownloadCSV={enableCSVDownload}
        />
        <DataTable
          isLoading={isLoading || isPreviousData}
          isPaginated
          manualPagination
          initialState={{
            pageSize: 50,
            pageIndex: 0,
          }}
          itemCount={paginatedData.itemCount}
          pageCount={paginatedData.pageCount}
          fetchData={fetchData}
          data={paginatedData.data}
          columns={tableColumns}
        >
          <DataTable.TableControlBar />
          <DataTable.Table />
          <DataTable.EmptyTable
            content={intl.formatMessage({
              id: 'advance.analytics.table.empty',
              defaultMessage: 'No results found.',
              description: 'Message displayed when the table has no data.',
            })}
          />
          <DataTable.TableFooter>
            <TablePaginationMinimal />
          </DataTable.TableFooter>
        </DataTable>
      </div>
    </div>
  );
};

AnalyticsTable.propTypes = {
  name: PropTypes.string.isRequired,
  tableColumns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  tableTitle: PropTypes.string.isRequired,
  tableSubtitle: PropTypes.string.isRequired,
  enableCSVDownload: PropTypes.bool.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};

export default AnalyticsTable;
