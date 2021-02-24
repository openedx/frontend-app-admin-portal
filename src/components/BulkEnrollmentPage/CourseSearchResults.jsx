import React, {
  useContext,
  useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
import {
  DataTable, Toast,
} from '@edx/paragon';
import { SearchContext, SearchPagination } from '@edx/frontend-enterprise';
import moment from 'moment';

import BulkEnrollmentModal from '../../containers/BulkEnrollmentModal';
import StatusAlert from '../StatusAlert';
import LoadingMessage from '../LoadingMessage';
import { configuration } from '../../config';

const ERROR_MESSAGE = 'An error occured while retrieving data';
export const NO_DATA_MESSAGE = 'There are no course results';

export const TABLE_HEADERS = {
  courseName: 'Course name',
  courseStartDate: 'Course start date',
};

export const CourseNameCell = ({ value, row, enterpriseSlug }) => (
  <a href={`${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row?.original?.key}`}>{value}</a>
);

CourseNameCell.propTypes = {
  value: PropTypes.string.isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      key: PropTypes.string.isRequired,
    }),
  }).isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export const FormattedDateCell = ({ value }) => <span>{moment(value).format('MMM D, YYYY')}</span>;

FormattedDateCell.propTypes = {
  value: PropTypes.string.isRequired,
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

  if (isSearchStalled) {
    return (<LoadingMessage className="overview mt-3" />);
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
      />
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
      >
        Your learners have been enrolled.
      </Toast>
      <div>
        <DataTable
          columns={columns}
          data={searchResults?.hits || []}
          itemCount={searchResults?.nbHits}
          isSelectable
          pageCount={searchResults?.nbPages || 1}
          pageSize={searchResults?.hitsPerPage || 0}
          bulkActions={[{
            buttonText: 'Enroll Learners',
            handleClick: (selectedRows) => {
              const courseRunKeys = selectedRows?.map(
                (selectedRow) => selectedRow.original?.advertised_course_run?.key,
              ) || [];
              setSelectedCourseRuns(courseRunKeys);
              setModalOpen(true);
            },
          }]}
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
