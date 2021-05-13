import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { DataTable, TextFilter } from '@edx/paragon';

import { Link } from 'react-router-dom';
import { useActiveSubscriptionUsers } from '../../subscriptions/data/hooks';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { ADD_LEARNERS_TITLE } from './constants';
import { convertToSelectedRowsObject } from '../helpers';
import TableLoadingSkeleton from '../../TableComponent/TableLoadingSkeleton';
import { BaseSelectWithContext, BaseSelectWithContextHeader } from '../table/BulkEnrollSelect';
import BaseSelectionStatus from '../table/BaseSelectionStatus';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';

export const TABLE_HEADERS = {
  email: 'Email',
};

export const LINK_TEXT = 'Subscription management';

const tableColumns = [
  {
    Header: TABLE_HEADERS.email,
    accessor: 'userEmail',
    Filter: TextFilter,
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
  enterpriseSlug,
}) => {
  const [errors, setErrors] = useState([]);
  const { emails: [selectedEmails] } = useContext(BulkEnrollContext);

  const [{ results: userData, count }, loading] = useActiveSubscriptionUsers({ subscriptionUUID, errors, setErrors });

  return (
    <>
      <p>
        Select learners to enroll from the list of all learners with an active or pending subscription license below.
        If you wish to enroll additional learners not shown, please first invite them under{' '}
        <Link to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${subscriptionUUID}`}>{LINK_TEXT}</Link>
      </p>
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
          isFilterable
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
  enterpriseSlug: PropTypes.string.isRequired,
};

export default AddLearnersStep;
