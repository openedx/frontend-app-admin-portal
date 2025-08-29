import React from 'react';
import PropTypes from 'prop-types';
import { Form, Icon } from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';

const formatHeaderForLabel = (Header) => {
  if (typeof Header === 'function') {
    return Header();
  }
  if (typeof Header === 'string') {
    return Header.toLowerCase();
  }
  return Header;
};

const TableTextFilter = ({
  column: {
    filterValue, setFilter, Header,
  },
}) => {
  const inputText = `Search by ${formatHeaderForLabel(Header)}`;
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
