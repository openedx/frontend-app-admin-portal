import React, { useContext, useEffect, useMemo } from 'react';
import { connectStateResults } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';

import { SearchPagination, SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, CardView, DataTable, TextFilter,
} from '@edx/paragon';

import CourseCard from '../cards/CourseCard';
import { SEARCH_RESULT_PAGE_SIZE } from '../data';

export const ERROR_MESSAGE = 'An error occurred while retrieving data';

/**
 * The core search results rendering component.
 *
 * Wrapping this in `connectStateResults()` will inject the first few props.
 *
 * @param {object} args arguments
 * @param {object} args.searchResults Results of search (see: `connectStateResults``)
 * @param {Boolean} args.isSearchStalled Whether search is stalled (see: `connectStateResults`)
 * @param {object} args.error Error with `message` field if available (see: `connectStateResults``)
 */

export const BaseCatalogSearchResults = ({
  searchResults,
  searchState,
  // algolia recommends this prop instead of searching
  isSearchStalled,
  paginationComponent: PaginationComponent,
  error,
  setNoContent,
}) => {
  const courseColumns = useMemo(
    () => [
      {
        Header: 'Course name',
        accessor: 'title',
      },
      {
        Header: 'Partner',
        accessor: 'partners[0].name',
      },
      {
        Header: 'A la carte course price',
        accessor: 'first_enrollable_paid_seat_price',
      },
      {
        Header: 'Associated catalogs',
        accessor: 'enterprise_catalog_query_titles',
      },
    ],
    [],
  );

  const tableData = useMemo(
    () => searchResults?.hits || [],
    [searchResults?.hits],
  );
  const { refinements } = useContext(SearchContext);
  const page = refinements.page || (searchState.page || 0);

  useEffect(() => {
    setNoContent(searchResults === null || searchResults?.nbHits === 0);
  }, [searchResults, setNoContent]);

  if (error) {
    return (
      <Alert className="mt-2" variant="warning">
        <FormattedMessage
          id="catalogs.catalogSearchResults.error"
          defaultMessage="{message}: {fullError}"
          description="Error message displayed when results cannot be returned."
          values={{ message: ERROR_MESSAGE, fullError: error.message }}
        />
      </Alert>
    );
  }

  return (
    <div className="mb-5">
      <DataTable
        columns={courseColumns}
        data={tableData}
        defaultColumnValues={{ Filter: TextFilter }}
        initialState={{
          pageSize: SEARCH_RESULT_PAGE_SIZE,
          pageIndex: 0,
        }}
        isLoading={isSearchStalled}
        isPaginated
        itemCount={searchResults?.nbHits || 0}
        manualFilters
        manualPagination
        pageCount={searchResults?.nbPages || 0}
      >
        <DataTable.TableControlBar />
        <CardView
          columnSizes={{ xs: 12 }}
          CardComponent={CourseCard}
        />
        <DataTable.EmptyTable content="No results found" />
        <DataTable.TableFooter className="justify-content-center">
          <PaginationComponent defaultRefinement={page} />
        </DataTable.TableFooter>
      </DataTable>
    </div>
  );
};

BaseCatalogSearchResults.defaultProps = {
  searchResults: { disjunctiveFacetsRefinements: [], nbHits: 0, hits: [] },
  error: null,
  paginationComponent: SearchPagination,
  setNoContent: () => {},
};

BaseCatalogSearchResults.propTypes = {
  // from Algolia
  searchResults: PropTypes.shape({
    _state: PropTypes.shape({
      disjunctiveFacetsRefinements: PropTypes.shape({}),
    }),
    disjunctiveFacetsRefinements: PropTypes.arrayOf(PropTypes.shape({})),
    nbHits: PropTypes.number,
    hits: PropTypes.arrayOf(PropTypes.shape({})),
    nbPages: PropTypes.number,
    hitsPerPage: PropTypes.number,
    page: PropTypes.number,
  }),
  isSearchStalled: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  searchState: PropTypes.shape({
    page: PropTypes.number,
  }).isRequired,
  paginationComponent: PropTypes.func,
  setNoContent: PropTypes.func,
};

export default connectStateResults(injectIntl(BaseCatalogSearchResults));
