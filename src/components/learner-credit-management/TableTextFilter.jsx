import React from 'react';
import PropTypes from 'prop-types';
import { Form, Icon } from '@edx/paragon';
import { Search } from '@edx/paragon/icons';

const TableTextFilter = ({
  column: {
    filterValue, setFilter, Header,
  },
}) => {
  const inputText = `Search by ${Header.toLowerCase()}`;
  return (
    <Form.Group>
      <Form.Control
        data-testid="text-filter"
        style={{ minWidth: 360 }}
        floatingLabel={inputText}
        trailingElement={<Icon src={Search} />}
        value={filterValue || ''}
        onChange={(e) => {
          setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
        }}
        autoComplete="off"
      />
    </Form.Group>
  );
};

TableTextFilter.propTypes = {
  column: PropTypes.shape({
    filterValue: PropTypes.string,
    setFilter: PropTypes.func,
    Header: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  }).isRequired,
};

export default TableTextFilter;
