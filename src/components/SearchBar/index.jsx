import React from 'react';
import PropTypes from 'prop-types';
import { SearchField } from '@edx/paragon';

class SearchBar extends React.Component {
  handleQuerySubmit(query) {
    this.props.onSearch(query);
  }

  render() {
    return (
      <SearchField
        onSubmit={query => this.props.onSearch(query)}
        {...this.props}
      />
    );
  }
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
