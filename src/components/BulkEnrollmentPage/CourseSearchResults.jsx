import React, {
  useContext,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';
import { DataTable } from '@edx/paragon';
import { SearchContext, SearchPagination } from '@edx/frontend-enterprise-catalog-search';

import StatusAlert from '../StatusAlert';
import { CourseNameCell, FormattedDateCell } from './table/CourseSearchResultsCells';
import { BulkEnrollContext } from './BulkEnrollmentContext';

import BaseSelectionStatus from './table/BaseSelectionStatus';
import { BaseSelectWithContext, BaseSelectWithContextHeader } from './table/BulkEnrollSelect';

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

const SelectWithContextHeader = (props) => <BaseSelectWithContextHeader contextKey="courses" {...props} />;

const selectColumn = {
  id: 'selection',
  Header: SelectWithContextHeader,
  Cell: SelectWithContext,
  disableSortBy: true,
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
    selectColumn,
    {
      Header: TABLE_HEADERS.courseName,
      accessor: 'title',
      // eslint-disable-next-line react/prop-types
      Cell: ({ value, row }) => <CourseNameCell value={value} row={row} enterpriseSlug={enterpriseSlug} />,
    },
    {
      Header: TABLE_HEADERS.partnerName,
      accessor: 'partners[0].name',
    },
    {
      Header: TABLE_HEADERS.courseAvailability,
      accessor: 'advertised_course_run',
      // eslint-disable-next-line react/prop-types
      Cell: ({ value }) => <FormattedDateCell startValue={value.start} endValue={value.end} />,
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

  const { courses: [selectedCourses] } = useContext(BulkEnrollContext);

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
      <StatusAlert
        alertType="danger"
        iconClassName="fa fa-times-circle"
        message={`${ERROR_MESSAGE} ${error.message}`}
      />
    );
  }
  if (!isSearchStalled && searchResults?.nbHits === 0) {
    return (
      <StatusAlert
        alertType="warning"
        iconClassName="fa fa-exclamation-circle"
        message={NO_DATA_MESSAGE}
      />
    );
  }

  return (
    <>
      <div className="data-table-selector-column-wrapper">
        <DataTable
          columns={columns}
          data={searchResults?.hits || []}
          itemCount={searchResults?.nbHits}
          SelectionStatusComponent={AddCoursesSelectionStatus}
          pageCount={searchResults?.nbPages || 1}
          pageSize={searchResults?.hitsPerPage || 0}
          selectedFlatRows={selectedCourses}
          initialTableOptions={{
            getRowId: (row) => row.key,
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
    </>
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
