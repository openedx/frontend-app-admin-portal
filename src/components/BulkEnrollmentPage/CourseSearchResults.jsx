import React, {
  useCallback,
  useContext,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
import { DataTable, Skeleton, Alert } from '@edx/paragon';
import { SearchContext, SearchPagination } from '@edx/frontend-enterprise-catalog-search';
import { WarningFilled, Error } from '@edx/paragon/icons';

import { CourseNameCell, FormattedDateCell } from './table/CourseSearchResultsCells';
import { BulkEnrollContext } from './BulkEnrollmentContext';

import BaseSelectionStatus from './table/BaseSelectionStatus';
import { BaseSelectWithContext } from './table/BulkEnrollSelect';
import { NUM_CONTENT_ITEMS_PER_PAGE } from './stepper/constants';
import { setSelectedRowsAction } from './data/actions';

const ERROR_MESSAGE = 'An error occured while retrieving data';
export const NO_DATA_MESSAGE = 'There are no course results';
export const ENROLL_TEXT = 'Enroll learners';
export const TABLE_HEADERS = {
  courseName: 'Course name',
  courseAvailability: 'Course availability',
  partnerName: 'Partner',
  enroll: '',
};

const AddCoursesSelectionStatus = (props) => {
  const { courses: [selectedCourses, dispatch] } = useContext(BulkEnrollContext);

  return <BaseSelectionStatus selectedRows={selectedCourses} dispatch={dispatch} {...props} />;
};

const SelectWithContext = (props) => <BaseSelectWithContext contextKey="courses" {...props} />;

const selectColumn = {
  id: 'selection',
  Header: () => null,
  Cell: SelectWithContext,
  disableSortBy: true,
};

export const TitleCell = ({
  value, row, enterpriseSlug,
}) => <CourseNameCell value={value} row={row} enterpriseSlug={enterpriseSlug} />;

TitleCell.propTypes = {
  value: PropTypes.string.isRequired,
  row: PropTypes.shape().isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export const BaseCourseSearchResults = (props) => {
  const {
    searchResults,
    // algolia recommends this prop instead of searching
    isSearchStalled,
    searchState,
    error,
    enterpriseSlug,
  } = props;

  const { refinements } = useContext(SearchContext);

  const columns = useMemo(() => [
    {
      Header: TABLE_HEADERS.courseName,
      accessor: 'title',
      /* eslint-disable react/prop-types */
      /* eslint-disable react/no-unstable-nested-components */
      Cell: ({ value, row }) => <CourseNameCell value={value} row={row} enterpriseSlug={enterpriseSlug} />,
      /* eslint-enable react/prop-types */
      /* eslint-enable react/no-unstable-nested-components */
    },
    {
      Header: TABLE_HEADERS.partnerName,
      accessor: 'partners[0].name',
    },
    {
      Header: TABLE_HEADERS.courseAvailability,
      accessor: 'advertised_course_run',
      /* eslint-disable react/prop-types */
      /* eslint-disable react/no-unstable-nested-components */
      Cell: ({ value }) => <FormattedDateCell startValue={value.start} endValue={value.end} />,
      /* eslint-enable react/prop-types */
      /* eslint-enable react/no-unstable-nested-components */
    },
  ], [enterpriseSlug]);

  const page = useMemo(
    () => {
      if (refinements.page) {
        return refinements.page;
      }
      return searchState?.page;
    },
    [searchState, refinements],
  );

  const { courses: [selectedCourses, coursesDispatch] } = useContext(BulkEnrollContext);
  const transformedSelectedRowIds = useMemo(
    () => {
      const selectedRowIds = {};
      selectedCourses.forEach((row) => {
        selectedRowIds[row.id] = true;
      });
      return selectedRowIds;
    },
    [selectedCourses],
  );

  const onSelectedRowsChanged = useCallback(
    (selectedRowIds) => {
      const selectedFlatRowIds = Object.keys(selectedRowIds).map(selectedRowId => selectedRowId);
      const transformedSelectedFlatRowIds = selectedFlatRowIds.map(rowId => ({
        id: rowId,
        values: {
          aggregationKey: rowId,
        },
      }));
      coursesDispatch(setSelectedRowsAction(transformedSelectedFlatRowIds));
    },
    [coursesDispatch],
  );

  if (isSearchStalled) {
    return (
      <>
        <div className="sr-only">Loading...</div>
        <Skeleton className="mt-3" height={50} count={25} />
      </>
    );
  }

  if (!isSearchStalled && error) {
    return (
      <Alert
        variant="danger"
        icon={Error}
      >
        {`${ERROR_MESSAGE} ${error.message}`}
      </Alert>
    );
  }
  if (!isSearchStalled && searchResults?.nbHits === 0) {
    return (
      <Alert
        variant="warning"
        icon={WarningFilled}
      >
        {NO_DATA_MESSAGE}
      </Alert>
    );
  }

  return (
    <div className="data-table-selector-column-wrapper">
      <DataTable
        columns={columns}
        data={searchResults?.hits || []}
        itemCount={searchResults?.nbHits}
        isSelectable
        isPaginated
        manualSelectColumn={selectColumn}
        onSelectedRowsChanged={onSelectedRowsChanged}
        SelectionStatusComponent={AddCoursesSelectionStatus}
        pageCount={searchResults?.nbPages || 1}
        initialState={{
          pageIndex: 0,
          pageSize: NUM_CONTENT_ITEMS_PER_PAGE,
          selectedRowIds: transformedSelectedRowIds,
        }}
        initialTableOptions={{
          getRowId: row => row.aggregation_key,
        }}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.TableFooter>
          <DataTable.RowStatus />
          <SearchPagination defaultRefinement={page} />
        </DataTable.TableFooter>
      </DataTable>
    </div>
  );
};

BaseCourseSearchResults.defaultProps = {
  searchResults: { nbHits: 0, hits: [] },
  error: null,
};

BaseCourseSearchResults.propTypes = {
  // from Algolia
  searchResults: PropTypes.shape({
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
  // from parent
  enterpriseSlug: PropTypes.string.isRequired,
};

export default connectStateResults(BaseCourseSearchResults);
