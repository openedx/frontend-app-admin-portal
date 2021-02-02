/* eslint-disable react/prop-types */
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults, connectPagination } from 'react-instantsearch-dom';
import { DataTable, Toast } from '@edx/paragon';

import BulkEnrollmentModal from '../../containers/BulkEnrollmentModal';
import StatusAlert from '../StatusAlert';
import LoadingMessage from '../LoadingMessage';

const emptyCourseResults = () => <div>No Courses found for this Enterprise</div>;
const ERROR_MESSAGE = 'An error occured while retrieving data.';
export const NO_DATA_MESSAGE = 'There are no results.';

export const BaseCourseSearchResults = ({
  enterpriseId,
  searchResults,
  searchState,
  setSearchState,
  searching,
  error,
}) => {
  const columns = [
    {
      Header: 'Course name',
      accessor: 'title',
    },
    {
      Header: 'Course run',
      accessor: 'advertised_course_run.key',
    },
  ];

  const initialState = useMemo(() => ({
    pageSize: searchResults?.hitsPerPage,
    pageIndex: searchResults?.page || 0,
  }), [searchResults?.page, searchResults?.hitsPerPage]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseRuns, setSelectedCourseRuns] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const fetchData = (newData) => {
    // don't change the query before results come back
    if (!searching && searchState?.page && newData.pageIndex + 1 !== searchState.page) {
      setSearchState({ ...searchState, page: newData.pageIndex + 1 });
    }
  };

  if (searching) {
    return (<LoadingMessage className="overview mt-3" />);
  }
  if (error) {
    return (
      <StatusAlert
        alertType="danger"
        iconClassName="fa fa-times-circle"
        message={`${ERROR_MESSAGE} ${error.message}`}
      />
    );
  }
  if (searchResults?.nbHits === 0) {
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
      <div className="container-fluid">
        <DataTable
          columns={columns}
          data={searchResults?.hits || []}
          itemCount={searchResults?.nbHits}
          EmptyTableComponent={emptyCourseResults}
          isSelectable
          isPaginated
          manualPagination
          pageCount={searchResults?.nbPages || 1}
          initialState={initialState}
          pageSize={searchResults?.hitsPerPage || 0}
          fetchData={fetchData}
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
        />
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
  searchResults: PropTypes.shape({ nbHits: PropTypes.number, hits: PropTypes.arrayOf(PropTypes.shape) }),
  enterpriseId: PropTypes.string,
  searching: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

export default connectPagination(connectStateResults(BaseCourseSearchResults));
