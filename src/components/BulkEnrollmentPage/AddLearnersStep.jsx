import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '@edx/paragon';

import { useAllSubscriptionUsers } from '../subscriptions/data/hooks';

const ERROR_MESSAGE = 'An error occured while retrieving data';
export const NO_DATA_MESSAGE = 'There are no learners for this subscription';
export const ENROLL_TEXT = 'Enroll learners';

export const TABLE_HEADERS = {
  email: 'Email',
};

const tableColumns = [
  {
    Header: TABLE_HEADERS.email,
    accessor: 'userEmail',
  },
];

export const AddLearnersStep = ({
  subscriptionUUID,
}) => {
  const [errors, setErrors] = useState([]);
  const { results: userData, count } = useAllSubscriptionUsers({ subscriptionUUID, errors, setErrors });

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
      />

    </>
  );
};

AddLearnersStep.propTypes = {
  subscriptionUUID: PropTypes.string.isRequired,
};

export default AddLearnersStep;
