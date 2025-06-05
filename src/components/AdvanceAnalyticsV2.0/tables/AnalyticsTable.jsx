import React, { useState, useCallback } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { DataTable, Icon } from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { Download } from '@openedx/paragon/icons';
import { analyticsDataTableKeys } from '../data/constants';

import { useEnterpriseAnalyticsData, usePaginatedData } from '../data/hooks';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';

const AnalyticsTable = ({
  name,
  tableColumns,
  tableTitle,
  tableSubtitle,
  startDate,
  endDate,
  enterpriseId,
  groupUUID,
}) => {
  const intl = useIntl();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const {
    isFetching, data,
  } = useEnterpriseAnalyticsData({
    enterpriseCustomerUUID: enterpriseId,
    key: analyticsDataTableKeys[name],
    startDate,
    endDate,
    groupUUID,
    // pages index from 1 in backend, frontend components index from 0
    currentPage: currentPage + 1,
    pageSize,
  });

  const CSVDownloadURL = EnterpriseDataApiService.getAnalyticsCSVDownloadURL(
    analyticsDataTableKeys[name],
    enterpriseId,
    {
      start_date: startDate,
      end_date: endDate,
      groupUUID,
    },
  );

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
      <div className="analytics-datatable-container">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h2 className="analytics-header-title mb-0">{tableTitle}</h2>
          <Link
            to={CSVDownloadURL}
            target="_blank"
            className="btn btn-sm btn-primary rounded-0"
          >
            <Icon src={Download} className="me-2" />
            <FormattedMessage
              id="adminPortal.AnalyticsV2.downloadCSV.button"
              defaultMessage="Download {respectiveTableName} CSV"
              description="Button to download CSV for respective table"
              values={{ respectiveTableName: name.charAt(0).toUpperCase() + name.slice(1) }}
            />
          </Link>
        </div>

        {tableSubtitle && (
        <p className="analytics-header-subtitle mb-3">{tableSubtitle}</p>
        )}

        <DataTable
          isLoading={isFetching}
          isPaginated
          manualPagination
          initialState={{
            pageSize,
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
          <DataTable.TableFooter />
        </DataTable>
      </div>
    </div>
  );
};

AnalyticsTable.defaultProps = {
  groupUUID: undefined,
};

AnalyticsTable.propTypes = {
  name: PropTypes.string.isRequired,
  tableColumns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  tableTitle: PropTypes.string.isRequired,
  tableSubtitle: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  groupUUID: PropTypes.string,
};

export default AnalyticsTable;
