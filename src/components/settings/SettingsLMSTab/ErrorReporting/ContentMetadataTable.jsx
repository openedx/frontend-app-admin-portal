import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, TextFilter,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import LmsApiService from '../../../../data/services/LmsApiService';
import DownloadCsvButton from './DownloadCsvButton';
import { getSyncStatus, getSyncTime } from './utils';

function ContentMetadataTable({ config, enterpriseCustomerUuid }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await LmsApiService.fetchContentMetadataItemTransmission(
        enterpriseCustomerUuid, config.channelCode, config.id,
      );
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
        defaultColumnValues={{ Filter: TextFilter }}
        isPaginated
        itemCount={data?.length}
        data={data}
        // eslint-disable-next-line no-unused-vars
        tableActions={[
          <DownloadCsvButton data={data} />,
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
            Cell: ({ row }) => getSyncStatus(row.original.sync_status),
            sortable: true,
          },
          {
            Header: 'Sync attempt time',
            accessor: 'sync_last_attempted_at',
            Cell: ({ row }) => getSyncTime(row.original.sync_last_attempted_at),
            sortable: true,
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
