/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults, connectPagination } from 'react-instantsearch-dom';
import { DataTable } from '@edx/paragon';

const emptyCourseResults = () => <div>No Courses found for this Enterprise</div>;

export const BaseCourseSearchResults = ({
  searchResults,
  searchState,
  setSearchState,
}) => {
  const columns = [
    {
      Header: 'Course name',
      accessor: 'title',
    },
    {
      Header: 'Course run',
      accessor: 'course_run',
    },
  ];
  console.log('SEARCH RESULTS PAGE INDEX', searchResults.page, searchState.page);

  const initialState = useMemo(() => ({
    pageSize: searchResults?.hitsPerPage,
    pageIndex: searchResults?.page || 0,
  }), [searchResults?.pageIndex, searchResults?.nbPages, searchResults?.hitsPerPage]);

  const fetchData = (newData) => {
    if (searchState?.page && newData.pageIndex + 1 !== searchState.page) {
      setSearchState({ ...searchState, page: newData.pageIndex + 1 });
    }
  };

  return (
    <div className="container-fluid">

      {searchResults && (
      <DataTable
        columns={columns}
        data={searchResults?.hits || []}
        itemCount={searchResults?.nbHits || 0}
        EmptyTableComponent={emptyCourseResults}
        isSelectable
        isPaginated
        manualPagination
        pageCount={searchResults?.nbPages || 1}
        initialState={initialState}
        pageSize={searchResults?.hitsPerPage || 0}
        fetchData={fetchData}
      />
      )}
    </div>
  );
};

BaseCourseSearchResults.defaultProps = {
  searchResults: { nbHits: 0, hits: [] },

};

BaseCourseSearchResults.propTypes = {
  searchResults: PropTypes.shape({ nbHits: PropTypes.number, hits: PropTypes.arrayOf(PropTypes.shape) }),
  refine: PropTypes.func.isRequired,
};

export default connectPagination(connectStateResults(BaseCourseSearchResults));
