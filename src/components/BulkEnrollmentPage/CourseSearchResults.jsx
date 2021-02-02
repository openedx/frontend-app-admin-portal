/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
import { DataTable } from '@edx/paragon';

const emptyCourseResults = () => <div>No Courses found for this Enterprise</div>;

export const BaseCourseSearchResults = ({
  searchResults,
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

  const initialState = useMemo(() => ({
    pageSize: searchResults?.hitsPerPage,
    pageIndex: searchResults?.pageIndex || 0,
    pageCount: searchResults?.nbPages || 1,
  }), [searchResults?.pageIndex]);

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
        pageCount={searchResults?.pageCount}
        initialState={initialState}

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
