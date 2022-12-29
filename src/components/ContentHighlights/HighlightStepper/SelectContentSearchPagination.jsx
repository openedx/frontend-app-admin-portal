import React from 'react';
import PropTypes from 'prop-types';
import { connectPagination } from 'react-instantsearch-dom';
import { ActionRow, Pagination, DataTable } from '@edx/paragon';

export const BaseSearchPagination = ({
  nbPages,
  currentRefinement,
  refine,
}) => (
  <ActionRow>
    <DataTable.RowStatus />
    <ActionRow.Spacer />
    <Pagination.Reduced
      currentPage={currentRefinement}
      handlePageSelect={(pageNum) => refine(pageNum)}
      pageCount={nbPages}
    />
    <ActionRow.Spacer />
    <Pagination
      variant="minimal"
      currentPage={currentRefinement}
      pageCount={nbPages}
      paginationLabel="select content pagination"
      onPageSelect={(pageNum) => refine(pageNum)}
    />
  </ActionRow>
);

BaseSearchPagination.propTypes = {
  nbPages: PropTypes.number.isRequired,
  currentRefinement: PropTypes.number.isRequired,
  refine: PropTypes.func.isRequired,
};

export default connectPagination(BaseSearchPagination);
