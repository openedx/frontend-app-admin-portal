import React, { useEffect, useMemo } from 'react';
import { connectStateResults } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';

import { SearchPagination } from '@edx/frontend-enterprise-catalog-search';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, CardView, DataTable, Skeleton,
} from '@edx/paragon';

import CourseCard from '../cards/CourseCard';

export const ERROR_MESSAGE = 'An error occurred while retrieving data';

export const SKELETON_DATA_TESTID = 'enterprise-catalog-skeleton';

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
  // algolia recommends this prop instead of searching
  isSearchStalled,
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

  const renderCardComponent = (props) => <CourseCard {...props} onClick={null} />;

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
    <div className="mb-5">
      <DataTable
        isPaginated
        manualPagination
        columns={courseColumns}
        data={tableData}
        itemCount={searchResults?.nbHits || 0}
        pageCount={searchResults?.nbPages || 1}
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
        <DataTable.TableFooter />
      </DataTable>
    </div>
  );
};

BaseCatalogSearchResults.defaultProps = {
  searchResults: { disjunctiveFacetsRefinements: [], nbHits: 0, hits: [] },
  error: null,
  paginationComponent: SearchPagination,
  row: null,
  preview: false,
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
  // eslint-disable-next-line react/no-unused-prop-types
  row: PropTypes.string,
  contentType: PropTypes.string.isRequired,
  preview: PropTypes.bool,
  setNoContent: PropTypes.func,
};

export default connectStateResults(injectIntl(BaseCatalogSearchResults));
