/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
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
  console.log("SEARCH RESULTS", searchResults)

  const initialState = useMemo(() => ({
    pageSize: searchResults?.hitsPerPage,
    pageIndex: searchResults?.pageIndex || 0,
  }), [searchResults?.pageIndex, searchResults?.nbPages, searchResults?.hitsPerPage]);

  console.log("INITIAL STATE", initialState)

  const fetchData = (newData) => {
    console.log(newData);
    if (newData.pageIndex + 1 !== searchState.page) {
      setSearchState({ ...searchState, page: newData.pageIndex + 1 });
    }
  };

  return (
    <div className="container-fluid">

      <DataTable
        columns={columns}
        data={searchResults?.hits || []}
        itemCount={searchResults?.nbHits || 0}
        EmptyTableComponent={emptyCourseResults}
        isSelectable
        isPaginated
        manualPagination
        pageCount={searchResults?.pageCount || 1}
        initialState={initialState}
        fetchData={fetchData}
      />
    </div>
  );
};

BaseCourseSearchResults.defaultProps = {
  searchResults: { nbHits: 0, hits: [] },
};

BaseCourseSearchResults.propTypes = {
  searchResults: PropTypes.shape({ nbHits: PropTypes.number, hits: PropTypes.arrayOf(PropTypes.shape) }),
};

export default connectStateResults(BaseCourseSearchResults);
