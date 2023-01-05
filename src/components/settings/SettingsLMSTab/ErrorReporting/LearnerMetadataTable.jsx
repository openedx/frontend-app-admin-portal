import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { DataTable, TextFilter } from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import LmsApiService from '../../../../data/services/LmsApiService';
import { createLookup, getSyncStatus, getTimeAgo } from './utils';
import DownloadCsvButton from './DownloadCsvButton';
import { CORNERSTONE_TYPE } from '../../data/constants';

const LearnerMetadataTable = ({ config, enterpriseCustomerUuid }) => {
  const [currentPage, setCurrentPage] = useState();
  const [currentFilters, setCurrentFilters] = useState();
  const [paginationData, setPaginationData] = useState({
    itemCount: 0,
    pageCount: 0,
    data: [],
    sortBy: '',
  });
  const [totalCount, setTotalCount] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      const correctedChannelCode = config.channelCode === CORNERSTONE_TYPE ? 'cornerstone' : config.channelCode;
      const response = await LmsApiService.fetchLearnerMetadataItemTransmission(
        enterpriseCustomerUuid,
        correctedChannelCode,
        config.id,
        currentPage,
        currentFilters,
      );

      return response;
    };

    fetchData()
      .then((response) => {
        setTotalCount(response.data.count);
        setPaginationData({
          itemCount: response.data.count,
          pageCount: response.data.pages_count,
          data: response.data.results,
        });
      })
      .catch((err) => {
        logError(err);
      });
  }, [
    config.channelCode,
    config.id,
    enterpriseCustomerUuid,
    currentPage,
    currentFilters,
  ]);

  const fetchData = useCallback(
    (args) => {
      let newFilters = createLookup(
        args.filters,
        (filter) => filter.id,
        (filter) => filter.value,
      );
      const sortBy = args.sortBy.at(-1);
      if (!_.isEmpty(sortBy)) {
        const newSortBys = { sort_by: `${sortBy.desc ? '-' : ''}${sortBy.id}` };
        newFilters = { ...newFilters, ...newSortBys };
      }

      if (!_.isEqual(newFilters, currentFilters)) {
        setCurrentFilters(newFilters);
      }
      if (args.pageIndex !== currentPage) {
        setCurrentPage(args.pageIndex);
      }
    },
    [currentFilters, currentPage, setCurrentFilters, setCurrentPage],
  );

  const fetchCsvData = async () => {
    const csvFilters = { ...currentFilters, ...{ page_size: totalCount } };
    const response = await LmsApiService.fetchLearnerMetadataItemTransmission(
      enterpriseCustomerUuid,
      config.channelCode,
      config.id,
      false,
      csvFilters,
    );
    return response;
  };

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
        tableActions={[
          <DownloadCsvButton
            fetchData={fetchCsvData}
            data={paginationData.data}
            testId="learner-download"
          />,
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
            Cell: ({ row }) => getSyncStatus(
              row.original.sync_status,
              row.original.friendly_status_message,
            ),
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
