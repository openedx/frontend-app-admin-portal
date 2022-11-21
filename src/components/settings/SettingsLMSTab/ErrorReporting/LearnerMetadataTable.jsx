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
import { createLookup, getSyncStatus, getSyncTime } from './utils';
import DownloadCsvButton from './DownloadCsvButton';

const LearnerMetadataTable = ({ config, enterpriseCustomerUuid }) => {
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
      const response = await LmsApiService.fetchLearnerMetadataItemTransmission(
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
        manualFilters
        manualPagination
        manualSortBy
        pageCount={paginationData.pageCount}
        itemCount={paginationData.itemCount}
        numBreakoutFilters={2}
        defaultColumnValues={{ Filter: TextFilter }}
        isPaginated
        fetchData={fetchData}
        data={paginationData.data}
        initialState={{
          pageSize: 10,
          pageIndex: currentPage || 0,
          sortBy: [],
        }}
        // eslint-disable-next-line no-unused-vars
        tableActions={[
          <DownloadCsvButton data={paginationData.data} testId="learner-download" />,
        ]}
        columns={[
          {
            Header: 'Learner email',
            accessor: 'user_email',
          },
          {
            Header: 'Course',
            accessor: 'content_title',
          },
          {
            Header: 'Completion status',
            accessor: 'progress_status',
            sortable: true,
            disableFilters: true,
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
            Cell: ({ row }) => getSyncTime(row.original.sync_last_attempted_at),
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

LearnerMetadataTable.defaultProps = {
  config: null,
};

LearnerMetadataTable.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.number,
    channelCode: PropTypes.string.isRequired,
  }),
  enterpriseCustomerUuid: PropTypes.string.isRequired,
};

export default LearnerMetadataTable;
