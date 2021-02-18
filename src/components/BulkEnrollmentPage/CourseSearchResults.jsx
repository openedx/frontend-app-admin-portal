import React, {
  useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
import {
  DataTable, Toast,
} from '@edx/paragon';

import BulkEnrollmentModal from '../../containers/BulkEnrollmentModal';
import StatusAlert from '../StatusAlert';
import LoadingMessage from '../LoadingMessage';
import ConnectedPagination from './ConnectedPagination';

const emptyCourseResults = () => <div>No Courses found for this Enterprise</div>;
const ERROR_MESSAGE = 'An error occured while retrieving data';
export const NO_DATA_MESSAGE = 'There are no results';

export const BaseCourseSearchResults = ({
  enterpriseId,
  searchResults,
  // algolia recommends this prop instead of searching
  isSearchStalled,
  error,
}) => {
  const columns = useMemo(() => [
    {
      Header: 'Course name',
      accessor: 'title',
    },
    {
      Header: 'Course run',
      accessor: 'advertised_course_run.key',
    },
  ], []);

  const initialTableState = useMemo(() => ({
    pageSize: searchResults?.hitsPerPage,
    pageIndex: searchResults?.page || 0,
  }), [searchResults?.page, searchResults?.hitsPerPage]);

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
          EmptyTableComponent={emptyCourseResults}
          isSelectable
          isPaginated
          manualPagination
          pageCount={searchResults?.nbPages || 1}
          initialState={initialTableState}
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
            <ConnectedPagination />
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
  searchResults: PropTypes.shape({
    nbHits: PropTypes.number,
    hits: PropTypes.arrayOf(PropTypes.shape({})),
    nbPages: PropTypes.number,
    hitsPerPage: PropTypes.number,
    page: PropTypes.number,
  }),
  enterpriseId: PropTypes.string,
  isSearchStalled: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

export default connectStateResults(BaseCourseSearchResults);
