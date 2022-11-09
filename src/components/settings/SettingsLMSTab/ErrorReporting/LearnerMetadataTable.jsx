import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, TextFilter,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import LmsApiService from '../../../../data/services/LmsApiService';
import { getSyncStatus, getSyncTime } from './utils';
import DownloadCsvButton from './DownloadCsvButton';

function LearnerMetadataTable({ config, enterpriseCustomerUuid }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await
      LmsApiService.fetchLearnerMetadataItemTransmission(enterpriseCustomerUuid, config.channelCode, config.id);
      return response;
    };

    fetchData()
      .then((response) => {
        setData(response.data.results);
      })
      .catch((err) => {
        logError(err);
      });
  }, [config.channelCode, config.id, enterpriseCustomerUuid]);

  return (
    <div className="pt-4">
      <DataTable
        isSortable
        isFilterable
        numBreakoutFilters={2}
        defaultColumnValues={{ Filter: TextFilter }}
        isPaginated
        itemCount={data?.length}
        data={data}
        // eslint-disable-next-line no-unused-vars
        tableActions={[
          <DownloadCsvButton data={data} testId="learner-download" />,
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
}

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
