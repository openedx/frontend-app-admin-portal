import _ from 'lodash';
import React, {
  useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, TextFilter,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import LmsApiService from '../../../../data/services/LmsApiService';
import DownloadCsvButton from './DownloadCsvButton';
import { createLookup, getSyncStatus, getTimeAgo } from './utils';

const ContentMetadataTable = ({ config, enterpriseCustomerUuid }) => {
  const [currentPage, setCurrentPage] = useState();
  const [currentFilters, setCurrentFilters] = useState();
  const [paginationData, setPaginationData] = useState({
    itemCount: 0,
    pageCount: 0,
    data: [],
    sortBy: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await LmsApiService.fetchContentMetadataItemTransmission(
        enterpriseCustomerUuid,
        config.channelCode,
        config.id,
        currentPage,
        currentFilters,
      );
      return response;
    };

    fetchData()
      .then((response) => {
        setPaginationData({
          itemCount: response.data.count,
          pageCount: response.data.pages_count,
          data: response.data.results,
        });
      })
      .catch((err) => {
        logError(err);
      });
  }, [config.channelCode, config.id, enterpriseCustomerUuid, currentPage, currentFilters]);

  // Call back function, handles filters and page changes
  const fetchData = useCallback(
    (args) => {
      let newFilters = createLookup(args.filters, (filter) => filter.id, (filter) => filter.value);

      const sortBy = args.sortBy.at(-1);
      if (!_.isEmpty(sortBy)) {
        const newSortBys = { sort_by: `${sortBy.desc ? '-' : ''}${sortBy.id}` };
        newFilters = { ...newFilters, ...newSortBys };
      }
      setCurrentFilters(newFilters);

      if (args.pageIndex !== currentPage) {
        setCurrentPage(args.pageIndex);
      }
    },
    [setCurrentPage, currentPage],
  );

  return (
    <div className="pt-4">
      <DataTable
        isSortable
        isFilterable
        numBreakoutFilters={2}
        manualFilters
        defaultColumnValues={{ Filter: TextFilter }}
        isPaginated
        manualPagination
        pageCount={paginationData.pageCount}
        itemCount={paginationData.itemCount}
        fetchData={fetchData}
        manualSortBy
        initialState={{
          pageSize: 10,
          pageIndex: currentPage || 0,
          sortBy: [],
        }}
        data={paginationData.data}
        // eslint-disable-next-line no-unused-vars
        tableActions={[
          <DownloadCsvButton data={paginationData.data} testId="content-download" />,
        ]}
        columns={[
          {
            Header: 'Course',
            accessor: 'content_title',
          },
          {
            Header: 'Course key',
            accessor: 'content_id',
          },
          {
            Header: 'Sync status',
            accessor: 'sync_status',
            Cell: ({ row }) => getSyncStatus(row.original.sync_status, row.original.friendly_status_message),
            sortable: true,
            disableFilters: true,
          },
          {
            Header: 'Sync attempt time',
            accessor: 'sync_last_attempted_at',
            Cell: ({ row }) => getTimeAgo(row.original.sync_last_attempted_at),
            sortable: true,
            disableFilters: true,
          },
        ]}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.EmptyTable content="No results found" />
        <DataTable.TableFooter />
      </DataTable>
    </div>
  );
};

ContentMetadataTable.defaultProps = {
  config: null,
};

ContentMetadataTable.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.number,
    channelCode: PropTypes.string.isRequired,
  }),
  enterpriseCustomerUuid: PropTypes.string.isRequired,
};

export default ContentMetadataTable;
