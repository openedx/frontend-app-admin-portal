import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '@edx/paragon';

import { useAllSubscriptionUsers } from '../../subscriptions/data/hooks';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { ADD_LEARNERS_TITLE } from './constants';
import { convertToSelectedRowsObject } from '../helpers';
import TableLoadingSkeleton from '../../TableComponent/TableLoadingSkeleton';
import { BaseSelectWithContext, BaseSelectWithContextHeader } from '../table/BulkEnrollSelect';
import BaseSelectionStatus from '../table/BaseSelectionStatus';

export const TABLE_HEADERS = {
  email: 'Email',
};

const tableColumns = [
  {
    Header: TABLE_HEADERS.email,
    accessor: 'userEmail',
  },
];

const AddLearnersSelectionStatus = (props) => {
  const { emails: [selectedEmails, dispatch] } = useContext(BulkEnrollContext);

  return <BaseSelectionStatus selectedRows={selectedEmails} dispatch={dispatch} {...props} />;
};

const SelectWithContext = (props) => <BaseSelectWithContext contextKey="emails" {...props} />;

const SelectWithContextHeader = (props) => <BaseSelectWithContextHeader contextKey="emails" {...props} />;

const selectColumn = {
  id: 'selection',
  Header: SelectWithContextHeader,
  Cell: SelectWithContext,
  disableSortBy: true,
};

const AddLearnersStep = ({
  subscriptionUUID,
}) => {
  const [errors, setErrors] = useState([]);
  const { emails: [selectedEmails] } = useContext(BulkEnrollContext);

  // TODO: Get an unpaginated list of all users from the backend. We can paginate on the frontend.
  const [{ results: userData, count }, loading] = useAllSubscriptionUsers({ subscriptionUUID, errors, setErrors });

  return (
    <>
      <h2>{ADD_LEARNERS_TITLE}</h2>
      {loading && <TableLoadingSkeleton data-testid="skelly" />}
      {!loading && userData && (
        <DataTable
          columns={tableColumns}
          manualSelectColumn={selectColumn}
          data={userData}
          itemCount={count}
          isSelectable
          isPaginated
          SelectionStatusComponent={AddLearnersSelectionStatus}
          initialState={{
            pageSize: 25,
            pageIndex: 0,
            selectedRowIds: convertToSelectedRowsObject(selectedEmails),
          }}
          initialTableOptions={{
            getRowId: (row, relativeIndex, parent) => row?.uuid || (parent ? [parent.id, relativeIndex].join('.') : relativeIndex),
          }}
        />
      )}
    </>
  );
};

AddLearnersStep.propTypes = {
  subscriptionUUID: PropTypes.string.isRequired,
};

export default AddLearnersStep;
