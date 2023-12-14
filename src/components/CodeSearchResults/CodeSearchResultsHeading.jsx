import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

const CodeSearchResultsHeading = ({ searchQuery, onClose }) => (
  <div className="d-flex align-items-center justify-content-between mb-3">
    <div className="flex-grow-1 text-truncate mr-3">
      <h3 className="lead m-0 text-truncate">
        Search results for <em>&quot;{searchQuery}&quot;</em>
      </h3>
    </div>
    <div className="flex-grow-0 flex-shrink-0">
      <Button
        variant="outline-primary"
        className="close-search-results-btn"
        onClick={onClose}
      >
        <Icon className="mr-2" src={Close} />
        Close search results
      </Button>
    </div>
  </div>
);

CodeSearchResultsHeading.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CodeSearchResultsHeading;
