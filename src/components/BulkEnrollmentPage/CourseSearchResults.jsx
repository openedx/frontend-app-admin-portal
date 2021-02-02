/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults, connectPagination } from 'react-instantsearch-dom';
import { DataTable } from '@edx/paragon';
import StatusAlert from '../StatusAlert';
import LoadingMessage from '../LoadingMessage';

const emptyCourseResults = () => <div>No Courses found for this Enterprise</div>;
const ERROR_MESSAGE = 'An error occured while retrieving data.';
export const NO_DATA_MESSAGE = 'There are no results.';

export const BaseCourseSearchResults = ({
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
      accessor: 'course_run',
    },
  ];

  const initialState = useMemo(() => ({
    pageSize: searchResults?.hitsPerPage,
    pageIndex: searchResults?.page || 0,
  }), [searchResults?.page, searchResults?.hitsPerPage]);

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
    />
  );
};

BaseCourseSearchResults.defaultProps = {
  searchResults: { nbHits: 0, hits: [] },
  error: null,
};

BaseCourseSearchResults.propTypes = {
  searchResults: PropTypes.shape({ nbHits: PropTypes.number, hits: PropTypes.arrayOf(PropTypes.shape) }),
  searching: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

export default connectPagination(connectStateResults(BaseCourseSearchResults));
