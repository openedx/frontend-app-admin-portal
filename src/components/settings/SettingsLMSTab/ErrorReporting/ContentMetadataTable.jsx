import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as timeago from 'timeago.js';

import {
  DataTable, TextFilter,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { CheckCircle, Error, Sync } from '@edx/paragon/icons';
import LmsApiService from '../../../../data/services/LmsApiService';

function ContentMetadataTable({ config, enterpriseCustomerUuid }) {
  const [data, setData] = useState([]);
  timeago.register('time-locale');

  useEffect(() => {
    // declare the data fetching function
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

  const getSyncStatus = (status) => (
    <>
      {status === 'okay' && (<><CheckCircle className="text-success-600 mr-2" />Success</>)}
      {status === 'error' && (<><Error className="text-danger-500 mr-2" /> Error</>)}
      {status === 'pending' && (<><Sync className="mr-2" /> Pending</>)}
    </>
  );

  const getSyncTime = (time) => (
    <div>{timeago.format(time, 'time-locale')}</div>
  );

  return (
    <div className="pt-4">
      <DataTable
        isSortable
        isFilterable
        defaultColumnValues={{ Filter: TextFilter }}
        isPaginated
        itemCount={data?.length}
        data={data}
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

ContentMetadataTable.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.number,
    channelCode: PropTypes.string.isRequired,
  }).isRequired,
  enterpriseCustomerUuid: PropTypes.string.isRequired,
};

export default ContentMetadataTable;
