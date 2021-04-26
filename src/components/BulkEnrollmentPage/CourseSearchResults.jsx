import React, {
  useContext,
  useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';
import {
  DataTable, Toast, Button,
} from '@edx/paragon';
import { SearchContext, SearchPagination } from '@edx/frontend-enterprise';

import BulkEnrollmentModal from '../../containers/BulkEnrollmentModal';
import StatusAlert from '../StatusAlert';
import { CourseNameCell, FormattedDateCell } from './CourseSearchResultsCells';

const ERROR_MESSAGE = 'An error occured while retrieving data';
export const NO_DATA_MESSAGE = 'There are no course results';
export const ENROLL_TEXT = 'Enroll learners';
export const TABLE_HEADERS = {
  courseName: 'Course name',
  courseStartDate: 'Course start date',
  enroll: '',
};

export const EnrollButton = ({ row, setSelectedCourseRuns, setModalOpen }) => {
  const handleClick = useMemo(() => () => {
    setSelectedCourseRuns([row.original?.advertised_course_run?.key]);
    setModalOpen(true);
  }, [setSelectedCourseRuns, setModalOpen, row.original?.advertised_course_run?.key]);
  return (
    <Button
      className="enroll-button"
      variant="link"
      onClick={handleClick}
    >
      {ENROLL_TEXT}
    </Button>
  );
};

EnrollButton.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      advertised_course_run: PropTypes.shape({
        key: PropTypes.string,
      }),
    }),
  }).isRequired,
  setSelectedCourseRuns: PropTypes.func.isRequired,
  setModalOpen: PropTypes.func.isRequired,
};

export const BaseCourseSearchResults = ({
  enterpriseId,
  searchResults,
  // algolia recommends this prop instead of searching
  isSearchStalled,
  searchState,
  error,
  enterpriseSlug,
}) => {
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

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseRuns, setSelectedCourseRuns] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [enrolledLearners, setEnrolledLearners] = useState([]);

  const handleBulkEnrollClick = useMemo(() => (selectedRows) => {
    const courseRunKeys = selectedRows?.map(
      (selectedRow) => selectedRow.original?.advertised_course_run?.key,
    ) || [];
    setSelectedCourseRuns(courseRunKeys);
    setModalOpen(true);
  }, [setModalOpen, setSelectedCourseRuns]);

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
      <BulkEnrollmentModal
        onSuccess={() => {
          setShowToast(true);
          setModalOpen(false);
        }}
        enterpriseUuid={enterpriseId}
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        selectedCourseRunKeys={selectedCourseRuns}
        setEnrolledLearners={setEnrolledLearners}
      />
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
      >
        {enrolledLearners} learners have been enrolled.
      </Toast>
      <DataTable
        columns={columns}
        data={searchResults?.hits || []}
        itemCount={searchResults?.nbHits}
        isSelectable
        pageCount={searchResults?.nbPages || 1}
        pageSize={searchResults?.hitsPerPage || 0}
        bulkActions={[{
          buttonText: ENROLL_TEXT,
          handleClick: handleBulkEnrollClick,
        }]}
        additionalColumns={[
          {
            id: 'enroll',
            Header: TABLE_HEADERS.enroll,
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => (
              <EnrollButton
                row={row}
                setSelectedCourseRuns={setSelectedCourseRuns}
                setModalOpen={setModalOpen}
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
  enterpriseId: '',
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
  enterpriseId: PropTypes.string,
  enterpriseSlug: PropTypes.string.isRequired,
};

export default connectStateResults(BaseCourseSearchResults);
