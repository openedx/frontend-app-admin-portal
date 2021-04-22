import React, { useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '@edx/paragon';

import { useAllSubscriptionUsers } from '../../subscriptions/data/hooks';
import { BulkEnrollContext } from '../BulkEnrollmentContext';

export const TABLE_HEADERS = {
  email: 'Email',
};

const tableColumns = [
  {
    Header: TABLE_HEADERS.email,
    accessor: 'userEmail',
  },
];

const AddLearnersStep = ({
  subscriptionUUID,
}) => {
  const [errors, setErrors] = useState([]);
  const { results: userData, count } = useAllSubscriptionUsers({ subscriptionUUID, errors, setErrors });
  const { emails: [, setSelectedEmails] } = useContext(BulkEnrollContext);

  const handleAddLearnersClick = useMemo(() => (selectedRows) => {
    const selectedEmails = selectedRows.map((row) => row.original.userEmail);
    setSelectedEmails(selectedEmails);
  }, [setSelectedEmails]);

  return (
    <>
      <h2>Add learners</h2>
      <DataTable
        columns={tableColumns}
        data={userData}
        itemCount={count}
        isSelectable
        isPaginated
        initialState={{
          pageSize: 25,
          pageIndex: 0,
        }}
        bulkActions={[
          {
            buttonText: 'Add learners',
            handleClick: handleAddLearnersClick,
          },
        ]}
      />
    </>
  );
};

AddLearnersStep.propTypes = {
  subscriptionUUID: PropTypes.string.isRequired,
};

export default AddLearnersStep;
