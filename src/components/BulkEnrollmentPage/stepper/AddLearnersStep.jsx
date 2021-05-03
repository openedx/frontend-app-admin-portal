import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { DataTable, Button, DataTableContext } from '@edx/paragon';

import { useAllSubscriptionUsers } from '../../subscriptions/data/hooks';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { ADD_LEARNERS_TITLE } from './constants';
import { convertToSelectedRowsObject } from '../helpers';
import TableLoadingSkeleton from '../../TableComponent/TableLoadingSkeleton';
import BulkEnrollSelectCol from '../BulkEnrollSelectCol';
import { addSelectedRowAction, clearSelectionAction, deleteSelectedRowAction, setSelectedRowsAction } from '../data/actions';

export const TABLE_HEADERS = {
  email: 'Email',
};

const tableColumns = [
  {
    Header: TABLE_HEADERS.email,
    accessor: 'userEmail',
  },
];

const SelectionStatus = ({
  className,
}) => {
  console.log('SHOWING SELECTION STATUS')
  const {
    itemCount, isAllRowsSelected, rows, toggleAllRowsSelected, selectedFlatRows, getToggleAllRowsSelectedProps,
  } = useContext(DataTableContext);
  const { emails: [selectedEmails, dispatch] } = useContext(BulkEnrollContext);
  const numSelectedRows = selectedEmails.length;
  console.log('SELECTED EMAILS', selectedEmails)
  console.log('IS ALL ROWS SELECTED', isAllRowsSelected)
  console.log('SELECTED FLAT ROWS', selectedFlatRows)
  console.log('GET ALL SELECTED TOGGLE PROPS', getToggleAllRowsSelectedProps())

  const toggleAllRowsSelectedBulkEnroll = isAllRowsSelected
    ? () => { toggleAllRowsSelected(false); dispatch(setSelectedRowsAction([]));}
    : () => { toggleAllRowsSelected(true); dispatch(setSelectedRowsAction(rows));  };

  return (
    <div className={className}>
      <span>{isAllRowsSelected && 'All '}{numSelectedRows} selected </span>
      {!isAllRowsSelected && (
        <Button
          variant="link"
          size="inline"
          onClick={toggleAllRowsSelectedBulkEnroll}
        >
          Select all {itemCount}
        </Button>
      )}
      {numSelectedRows > 0 && (
        <Button
          variant="link"
          size="inline"
          onClick={toggleAllRowsSelectedBulkEnroll}
        >
          Clear selection
        </Button>
      )}
    </div>
  );
};

const AddLearnersStep = ({
  subscriptionUUID,
}) => {
  const [errors, setErrors] = useState([]);
  const { emails: [selectedEmails] } = useContext(BulkEnrollContext);
  console.log('SELECTED EMAILS', selectedEmails)

  // TODO: Get an unpaginated list of all users from the backend. We can paginate on the frontend.
  const [{ results: userData, count }, loading] = useAllSubscriptionUsers({ subscriptionUUID, errors, setErrors });

  return (
    <>
      <h2>{ADD_LEARNERS_TITLE}</h2>
      {loading && <TableLoadingSkeleton data-testid="skelly" />}
      {!loading && userData && (
        <DataTable
          columns={tableColumns}
          manualSelectColumn={BulkEnrollSelectCol}
          data={userData}
          itemCount={count}
          isSelectable
          isPaginated
          SelectionStatusComponent={SelectionStatus}
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
