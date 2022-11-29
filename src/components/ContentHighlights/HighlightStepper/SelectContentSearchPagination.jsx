import React from 'react';
import PropTypes from 'prop-types';
import { connectPagination } from 'react-instantsearch-dom';
import { Pagination } from '@edx/paragon';

export const BaseSearchPagination = ({
  nbPages,
  currentRefinement,
  refine,
}) => (
  <>
    <Pagination.Reduced
      currentPage={currentRefinement}
      handlePageSelect={(pageNum) => refine(pageNum)}
      pageCount={nbPages}
    />
    <Pagination
      variant="minimal"
      currentPage={currentRefinement}
      pageCount={nbPages}
      paginationLabel="select content pagination"
      onPageSelect={(pageNum) => refine(pageNum)}
    />
  </>
);

BaseSearchPagination.propTypes = {
  nbPages: PropTypes.number.isRequired,
  currentRefinement: PropTypes.number.isRequired,
  refine: PropTypes.func.isRequired,
};

export default connectPagination(BaseSearchPagination);
