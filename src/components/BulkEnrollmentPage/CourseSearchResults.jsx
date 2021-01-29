/* eslint-disable react/prop-types */
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
import { DataTable, Toast } from '@edx/paragon';

import BulkEnrollmentModal from '../../containers/BulkEnrollmentModal';

const emptyCourseResults = () => <div>No Courses found for this Enterprise</div>;

export const BaseCourseSearchResults = ({
  searchResults, enterpriseId,
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
    pageIndex: searchResults?.pageIndex || 0,
    pageCount: searchResults?.nbPages || 1,
  }), [searchResults?.pageIndex]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseRuns, setSelectedCourseRuns] = useState([]);
  const [showToast, setShowToast] = useState(false);

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
          itemCount={searchResults?.nbHits || 0}
          EmptyTableComponent={emptyCourseResults}
          isSelectable
          isPaginated
          manualPagination
          pageCount={searchResults?.pageCount}
          initialState={initialState}
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
};

BaseCourseSearchResults.propTypes = {
  searchResults: PropTypes.shape({ nbHits: PropTypes.number, hits: PropTypes.arrayOf(PropTypes.shape) }),
  enterpriseId: PropTypes.string,
};

export default connectStateResults(BaseCourseSearchResults);
