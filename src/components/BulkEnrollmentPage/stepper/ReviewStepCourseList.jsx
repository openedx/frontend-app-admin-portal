import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { InstantSearch, Configure, connectStateResults } from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch/lite';
import { camelCaseObject } from '@edx/frontend-platform';

import { BulkEnrollContext } from '../BulkEnrollmentContext';
import ReviewList from './ReviewList';
import { configuration } from '../../../config';

const COURSES = {
  singular: 'course',
  plural: 'courses',
  title: 'Courses',
  removal: 'Remove course',
};

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const BaseContentSelections = ({
  searchResults,
  isSearchStalled,
  returnToSelection,
}) => {
  const {
    courses: [, coursesDispatch],
  } = useContext(BulkEnrollContext);

  const selectedRows = camelCaseObject(searchResults?.hits || []);
  // NOTE: The current implementation of `ReviewItem` relies on the data schema
  // from `DataTable` where each selected row has a `values` object containing
  // the metadata about each row and an `id` field representing the
  // `aggregationKey`. Transforming the data here allows us to avoid needing to
  // modify `ReviewItem`.
  const transformedSelectedRows = selectedRows.map((row) => ({
    values: row,
    id: row.aggregationKey,
  }));

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

const ReviewStepCourseList = ({
  returnToSelection,
}) => {
  const {
    courses: [selectedCourses],
  } = useContext(BulkEnrollContext);
  const searchFilters = useSearchFiltersForSelectedCourses(selectedCourses);

  return (
    <InstantSearch
      indexName={configuration.ALGOLIA.INDEX_NAME}
      searchClient={searchClient}
    >
      <Configure
        filters={searchFilters}
        hitsPerPage={1000}
      />
      <ContentSelections returnToSelection={returnToSelection} />
    </InstantSearch>
  );
};

ReviewStepCourseList.propTypes = {
  returnToSelection: PropTypes.func.isRequired,
};

export default ReviewStepCourseList;
