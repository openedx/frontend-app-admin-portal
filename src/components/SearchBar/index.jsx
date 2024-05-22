import React from 'react';
import PropTypes from 'prop-types';
import { SearchField } from '@openedx/paragon';

const SearchBar = props => (
  <SearchField
    onSubmit={query => props.onSearch(query)}
    {...props}
  />
);

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
