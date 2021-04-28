import React, { useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '@edx/paragon';

import { useAllSubscriptionUsers } from '../../subscriptions/data/hooks';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { ADD_LEARNERS_TITLE } from './constants';
import { setExportedTableInstance } from '../hooks';
import { convertToSelectedRowsObject } from '../helpers';
// import TableLoadingSkeleton from '../../TableComponent/TableLoadingSkeleton';

export const TABLE_HEADERS = {
  email: 'Email',
};

const tableColumns = [
  {
    Header: TABLE_HEADERS.email,
    accessor: 'userEmail',
  },
];

const ExportDataTableContext = () => {
  const { emails: [, emailsDispatch] } = useContext(BulkEnrollContext);
  setExportedTableInstance({ dispatch: emailsDispatch });
  return null;
};

const AddLearnersStep = ({
  subscriptionUUID,
}) => {
  const [errors, setErrors] = useState([]);
  const { emails: [selectedEmails] } = useContext(BulkEnrollContext);
  // TODO: Get an unpaginated list of all users from the backend. We can paginate on the frontend.
  const [{ results: userData, count }, loading] = useAllSubscriptionUsers({ subscriptionUUID, errors, setErrors });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h2>{ADD_LEARNERS_TITLE}</h2>
      <DataTable
        columns={tableColumns}
        data={userData}
        itemCount={count}
        isSelectable
        isPaginated
        initialState={{
          pageSize: 25,
          pageIndex: 0,
          selectedRowIds: convertToSelectedRowsObject(selectedEmails),
        }}
        initialTableOptions={{
          getRowId: (row) => row.uuid,
        }}
      >
        <ExportDataTableContext />
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.TableFooter />
      </DataTable>
    </>
  );
};

AddLearnersStep.propTypes = {
  subscriptionUUID: PropTypes.string.isRequired,
};

export default AddLearnersStep;
