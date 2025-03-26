import React from 'react';
import PropTypes from 'prop-types';
import { connectPagination } from 'react-instantsearch-dom';
import { ActionRow, DataTable, Pagination } from '@openedx/paragon';

export const BaseSearchPagination = ({
  nbPages,
  currentRefinement,
  refine,
}) => (
  <ActionRow>
    <DataTable.RowStatus />
    <ActionRow.Spacer />
    <Pagination
      variant="reduced"
      currentPage={currentRefinement}
      onPageSelect={(pageNum) => refine(pageNum)}
      pageCount={nbPages}
      // This field is intentionally left as an empty object to
      // remove redundant pagination chevrons
      icons={{}}
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
