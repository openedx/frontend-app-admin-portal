import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { InstantSearch, Configure, connectStateResults } from 'react-instantsearch-dom';
import { camelCaseObject } from '@edx/frontend-platform';
import { Col, Skeleton } from '@openedx/paragon';

import { BulkEnrollContext } from '../BulkEnrollmentContext';
import ReviewList from './ReviewList';
import { configuration } from '../../../config';
import { setSelectedRowsAction } from '../data/actions';
import { SearchUnavailableAlert, withAlgoliaSearch } from '../../algolia-search';
import type { SelectedRow } from '../data/types';
import type { UseAlgoliaSearchResult } from '../../algolia-search';

const COURSES = {
  singular: 'course',
  plural: 'courses',
  title: 'Courses',
  removal: 'Remove course',
};

export const BaseContentSelections = ({
  searchResults,
  isSearchStalled,
  returnToSelection,
}) => {
  const {
    courses: [selectedCourses, coursesDispatch],
  } = useContext(BulkEnrollContext);

  const transformedSelectedRows: SelectedRow[] = useMemo(() => {
    const selectedRows = camelCaseObject(searchResults?.hits || []);
    // NOTE: The current implementation of `ReviewItem` relies on the data schema
    // from `DataTable` where each selected row has a `values` object containing
    // the metadata about each row and an `id` field representing the
    // `aggregationKey`. Transforming the data here allows us to avoid needing to
    // modify `ReviewItem`.
    return selectedRows.map((row) => ({
      values: row,
      id: row.aggregationKey,
    }));
  }, [searchResults]);

  /**
   * Update the data in the reducer keeping track of course selections
   * with additional metadata for each selected row from Algolia.
   */
  useEffect(() => {
    if (transformedSelectedRows.length === 0) {
      return;
    }
    coursesDispatch(setSelectedRowsAction(transformedSelectedRows));
  }, [coursesDispatch, transformedSelectedRows, selectedCourses]);

  return (
    <ReviewList
      isLoading={isSearchStalled}
      rows={transformedSelectedRows}
      accessor="title"
      dispatch={coursesDispatch}
      subject={COURSES}
      returnToSelection={returnToSelection}
    />
  );
};

BaseContentSelections.propTypes = {
  searchResults: PropTypes.shape({
    hits: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      aggregationKey: PropTypes.string,
    })).isRequired,
  }),
  isSearchStalled: PropTypes.bool.isRequired,
  returnToSelection: PropTypes.func.isRequired,
};

BaseContentSelections.defaultProps = {
  searchResults: null,
};

const ContentSelections = connectStateResults(BaseContentSelections);

/**
 * Given a list of selected content, compute an Algolia search filter to return
 * the metadata for the selected content.
 *
 * @param {array} selectedCourses A list of selected rows, representing by the row ID (aggregation key)
 * @returns A filter string to pass to Algolia to query for the selected content.
 */
export const useSearchFiltersForSelectedCourses = (selectedCourses) => {
  const searchFilters = useMemo(
    () => {
      const extractAggregationKey = row => row?.id;
      const [firstSelectedCourse, ...restSelectedCourses] = selectedCourses;
      let filter = `aggregation_key:'${extractAggregationKey(firstSelectedCourse)}'`;
      restSelectedCourses.forEach((selectedRow) => {
        const aggregationKey = extractAggregationKey(selectedRow);
        filter += ` OR aggregation_key:'${aggregationKey}'`;
      });
      return filter;
    },
    [selectedCourses],
  );

  return searchFilters;
};

interface ReviewStepCourseListProps {
  returnToSelection: () => void;
  algolia: UseAlgoliaSearchResult;
}

export const BaseReviewStepCourseList = ({
  returnToSelection,
  algolia,
}: ReviewStepCourseListProps) => {
  const {
    courses: [selectedCourses],
  } = useContext(BulkEnrollContext);
  const searchFilters = useSearchFiltersForSelectedCourses(selectedCourses);

  if (algolia.isCatalogQueryFiltersEnabled && algolia.isLoading) {
    return (
      <Col>
        <Skeleton height={360} />
        <div data-testid="skeleton-algolia-loading-courses" className="sr-only">Loading courses...</div>
      </Col>
    );
  }

  if (!algolia.searchClient) {
    return (
      <Col>
        <SearchUnavailableAlert />
      </Col>
    );
  }

  return (
    <InstantSearch
      indexName={configuration.ALGOLIA.INDEX_NAME!}
      searchClient={algolia.searchClient}
    >
      <Configure filters={searchFilters} />
      <ContentSelections returnToSelection={returnToSelection} />
    </InstantSearch>
  );
};

export default withAlgoliaSearch(BaseReviewStepCourseList);
