import React from 'react';
import * as timeago from 'timeago.js';

import {
  DataTable, TextFilter,
} from '@edx/paragon';
import { CheckCircle, Error, Sync } from '@edx/paragon/icons';

function ContentMetadataTable() {
  timeago.register('time-locale');

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
        itemCount={3}
        data={[
          {
            content_title: 'edX Demonstration Course',
            content_id: 'DemoX',
            sync_status: 'okay',
            sync_last_attempted_at: '2022-09-21T19:27:18.127225Z',
            friendly_status_message: null,
          },
          {
            content_title: 'edX Demonstration Course 3',
            content_id: 'DemoX-3',
            sync_status: 'pending',
            sync_last_attempted_at: '2022-09-27T19:27:18.127225Z',
            friendly_status_message: null,
          },
          {
            content_title: 'edX Demonstration Course 2',
            content_id: 'DemoX-2',
            sync_status: 'error',
            sync_last_attempted_at: '2022-09-26T19:27:18.127225Z',
            friendly_status_message: null,
          }]}
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

export default ContentMetadataTable;
