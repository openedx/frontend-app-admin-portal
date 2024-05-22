import { Form, DataTableContext } from '@edx/paragon';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

const MembersTableSwitchFilter = ({ removedGroupMembersCount }) => {
  const { columns } = useContext(DataTableContext);
  // 'status' filter is in index 1
  const filterStatusColumn = columns[1];
  const { filterValue, setFilter } = filterStatusColumn;
  return (
    <Form.Switch
      className="ml-2.5 mt-2.5"
      checked={filterValue || false}
      onChange={() => {
        setFilter(!filterValue || false); // Set undefined to remove the filter entirely
      }}
      data-testid="show-removed-toggle"
    >
      Show removed ({removedGroupMembersCount})
    </Form.Switch>
  );
};

MembersTableSwitchFilter.propTypes = {
  removedGroupMembersCount: PropTypes.number.isRequired,
};

export default MembersTableSwitchFilter;
