import React, { useContext, useEffect, useMemo } from 'react';
import { connectStateResults } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';

import { SearchPagination, SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, CardView, DataTable, Skeleton, TextFilter
} from '@edx/paragon';

import CourseCard from '../cards/CourseCard';

const ERROR_MESSAGE = 'An error occurred while retrieving data';

const SKELETON_DATA_TESTID = 'enterprise-catalog-skeleton';

export const BaseCatalogSearchResults = ({
  searchResults,
  searchState,
  // algolia recommends this prop instead of searching
  isSearchStalled,
  paginationComponent: SearchPagination,
  error,
  setNoContent,
}) => {
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
  console.log(tableData)
  const renderCardComponent = (props) => <CourseCard {...props} onClick={null} />;
  const { refinements } = useContext(SearchContext);

  const page = refinements.page || (searchState ? searchState.page : 0);

  useEffect(() => {
    setNoContent(searchResults === null || searchResults?.nbHits === 0);
  }, [searchResults, setNoContent]);

  if (isSearchStalled) {
    return (
      <div data-testid={SKELETON_DATA_TESTID}>
        <Skeleton className="m-1 loading-skeleton" height={25} count={5} />
      </div>
    );
  }
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
    <DataTable
      columns={courseColumns}
      data={tableData}
      defaultColumnValues={{ Filter: TextFilter }}
      initialState={{
        pageSize: 15,
        pageIndex: 0,
      }}
      isPaginated
      isSortable
      itemCount={searchResults?.nbHits || 0}
      manualFilters
      manualPagination
      manualSortBy
      pageCount={searchResults?.nbPages || 0}
      pageSize={searchResults?.hitsPerPage || 0}
    >
      <DataTable.TableControlBar />
      <CardView
        columnSizes={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
        }}
        CardComponent={(props) => renderCardComponent(props)}
      />
      <DataTable.EmptyTable content="No results found" />
      <DataTable.TableFooter className="justify-content-center">
        <SearchPagination defaultRefinement={page} />
      </DataTable.TableFooter>
    </DataTable>
  );
};

BaseCatalogSearchResults.defaultProps = {
  courseType: null,
  error: null,
  paginationComponent: SearchPagination,
  preview: false,
  row: null,
  searchResults: { disjunctiveFacetsRefinements: [], nbHits: 0, hits: [] },
  setNoContent: () => { },
};

BaseCatalogSearchResults.propTypes = {
  contentType: PropTypes.string.isRequired,
  courseType: PropTypes.string,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  isSearchStalled: PropTypes.bool.isRequired,
  paginationComponent: PropTypes.func,
  preview: PropTypes.bool,
  row: PropTypes.string,
  searchResults: PropTypes.shape({
    _state: PropTypes.shape({
      disjunctiveFacetsRefinements: PropTypes.shape({}),
    }),
    disjunctiveFacetsRefinements: PropTypes.arrayOf(PropTypes.shape({})),
    hits: PropTypes.arrayOf(PropTypes.shape({})),
    hitsPerPage: PropTypes.number,
    nbHits: PropTypes.number,
    nbPages: PropTypes.number,
    page: PropTypes.number,
  }),
  searchState: PropTypes.shape({
    page: PropTypes.number,
  }).isRequired,
  setNoContent: PropTypes.func,
};

export default connectStateResults(injectIntl(BaseCatalogSearchResults));