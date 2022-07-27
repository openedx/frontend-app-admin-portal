import React from 'react';
import PropTypes from 'prop-types';
import { SearchField } from '@edx/paragon';

function SearchBar(props) {
  return (
    <SearchField
      onSubmit={query => props.onSearch(query)}
      {...props}
    />
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
