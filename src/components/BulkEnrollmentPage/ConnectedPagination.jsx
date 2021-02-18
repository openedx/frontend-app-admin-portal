import React, {
  useEffect, useContext,
} from 'react';
import PropTypes from 'prop-types';
import { connectPagination } from 'react-instantsearch-dom';
import {
  DataTable, DataTableContext,
} from '@edx/paragon';

export const BaseConnectedPagination = ({
  currentRefinement: algoliaPageNo,
  refine,
}) => {
  const { state: tableState } = useContext(DataTableContext);
  useEffect(() => {
    if (algoliaPageNo && tableState.pageIndex + 1 !== algoliaPageNo) {
      // algolia is 1 indexed and react-table is 0 indexed
      refine(tableState.pageIndex + 1);
    }
  }, [JSON.stringify(tableState), algoliaPageNo]);

  return <DataTable.TablePagination />;
};

BaseConnectedPagination.propTypes = {
  // from algolia
  currentRefinement: PropTypes.number.isRequired,
  refine: PropTypes.func.isRequired,
};

export default connectPagination(BaseConnectedPagination);
