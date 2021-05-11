import React, {
  useContext,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';
import {
  DataTable, /* Toast, */ Button,
} from '@edx/paragon';
import { SearchContext, SearchPagination } from '@edx/frontend-enterprise';

import StatusAlert from '../StatusAlert';
import { CourseNameCell, FormattedDateCell } from './table/CourseSearchResultsCells';
import { BulkEnrollContext } from './BulkEnrollmentContext';
import { convertToSelectedRowsObject } from './helpers';
import {
  setSelectedRowsAction,
} from './data/actions';

import BaseSelectionStatus from './table/BaseSelectionStatus';
import { BaseSelectWithContext, BaseSelectWithContextHeader } from './table/BulkEnrollSelect';

const ERROR_MESSAGE = 'An error occured while retrieving data';
export const NO_DATA_MESSAGE = 'There are no course results';
export const ENROLL_TEXT = 'Enroll learners';
export const TABLE_HEADERS = {
  courseName: 'Course name',
  courseStartDate: 'Course start date',
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

export const EnrollButton = ({ row, goToNextStep, dispatch }) => {
  const handleClick = () => {
    dispatch(setSelectedRowsAction([row]));
    goToNextStep();
  };

  return (
    <Button
      className="enroll-button"
      variant="link"
      onClick={handleClick}
      data-testid="tableEnrollButton"
    >
      {ENROLL_TEXT}
    </Button>
  );
};

EnrollButton.propTypes = {
  row: PropTypes.shape({ }).isRequired,
  goToNextStep: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export const BaseCourseSearchResults = (props) => {
  const {
    searchResults,
    // algolia recommends this prop instead of searching
    isSearchStalled,
    searchState,
    error,
    enterpriseSlug,
    goToNextStep,
  } = props;

  const { refinementsFromQueryParams } = useContext(SearchContext);
  const columns = useMemo(() => [
    {
      Header: TABLE_HEADERS.courseName,
      accessor: 'title',
      // eslint-disable-next-line react/prop-types
      Cell: ({ value, row }) => <CourseNameCell value={value} row={row} enterpriseSlug={enterpriseSlug} />,
    },
    {
      Header: TABLE_HEADERS.courseStartDate,
      accessor: 'advertised_course_run.start',
      Cell: FormattedDateCell,
    },
  ], []);

  const page = useMemo(
    () => {
      if (refinementsFromQueryParams.page) {
        return refinementsFromQueryParams.page;
      }
      return searchState && searchState.page;
    },
    [searchState?.page, refinementsFromQueryParams],
  );

  // const [showToast, setShowToast] = useState(false);
  const { courses: [selectedCourses, coursesDispatch] } = useContext(BulkEnrollContext);

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
      {/* TODO: Update toast when stepper is complete to show the enrollment message.
        And/or use the existing toast framework */}
      {/* <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
      >
        {`${enrolledLearners} learners have been enrolled.`}
      </Toast> */}
      <DataTable
        columns={columns}
        data={searchResults?.hits || []}
        itemCount={searchResults?.nbHits}
        manualSelectColumn={selectColumn}
        SelectionStatusComponent={AddCoursesSelectionStatus}
        isSelectable
        pageCount={searchResults?.nbPages || 1}
        pageSize={searchResults?.hitsPerPage || 0}
        initialState={{ selectedRowIds: convertToSelectedRowsObject(selectedCourses) }}
        initialTableOptions={{
          getRowId: (row) => row.key,
        }}
        additionalColumns={[
          {
            id: 'enroll',
            Header: TABLE_HEADERS.enroll,
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => (
              <EnrollButton
                row={row}
                dispatch={coursesDispatch}
                goToNextStep={goToNextStep}
              />
            ),
          },
        ]}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.TableFooter>
          <DataTable.RowStatus />
          <SearchPagination defaultRefinement={page} />
        </DataTable.TableFooter>
      </DataTable>
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
  goToNextStep: PropTypes.func.isRequired,
};

export default connectStateResults(BaseCourseSearchResults);
