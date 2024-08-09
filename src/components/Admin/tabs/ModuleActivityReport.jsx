import React, { useState, useCallback } from 'react';
import { DataTable } from '@openedx/paragon';
import _ from 'lodash';
import PropTypes from 'prop-types';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import DownloadCsvButton from './DownloadCSVButton';
import useModuleActivityReport from '../data/hooks';
import SearchBar from '../../SearchBar';

const ModuleActivityReport = ({ enterpriseId }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentFilters, setCurrentFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoading, paginationData } = useModuleActivityReport({
    enterpriseId, page: currentPage, filters: currentFilters, searchQuery,
  });

  const fetchData = useCallback(
    (args) => {
      let newFilters = { ...currentFilters };
      // disable pagination and sorting if the search query is not empty
      const sortBy = args.sortBy.at(-1);
      if (!_.isEmpty(sortBy)) {
        const newSortBys = { ordering: `${sortBy.desc ? '-' : ''}${sortBy.id}` };
        newFilters = { ...newFilters, ...newSortBys };
      }

      if (!_.isEqual(newFilters, currentFilters)) {
        setCurrentFilters(newFilters);
      }
      if (args.pageIndex !== currentPage) {
        setCurrentPage(args.pageIndex);
      }
    },
    [currentFilters, currentPage, setCurrentFilters, setCurrentPage],
  );
  const onSearch = (query) => {
    if (!_.isEqual(query, searchQuery)) {
      setCurrentPage(0);
      setSearchQuery(query);
    }
  };

  const fetchCsvData = async () => EnterpriseDataApiService.fetchEnterpriseModuleActivityReport(
    enterpriseId,
    { ...currentFilters, search: searchQuery },
    { csv: true },
  );

  return (
    <>
      <SearchBar
        onSearch={_.debounce(onSearch, 500)}
        onClear={() => onSearch('')}
        onChange={_.debounce(onSearch, 500)}
        className="mt-2 mb-2 w-25 "
        placeholder="Search email or course title"
      />
      <DataTable
        isLoading={isLoading}
        SelectionStatusComponent={DataTable.ControlledSelectionStatus}
        isPaginated
        manualPagination
        isSortable
        manualSortBy
        initialState={{
          pageSize: 50,
          pageIndex: 0,
        }}
        initialTableOptions={{
          getRowId: row => row.module_performance_unique_id,
        }}
        itemCount={paginationData.itemCount}
        pageCount={paginationData.pageCount}
        fetchData={fetchData}
        data={paginationData.data}
        columns={[
          {
            Header: 'Email',
            accessor: 'username',
          },
          {
            Header: 'Course Title',
            accessor: 'course_name',
          },
          {
            Header: 'Module',
            accessor: 'module_name',
          },
          {
            Header: 'Grade',
            accessor: 'module_grade',
          },
          {
            Header: '% Activities Complete',
            accessor: 'percentage_completed_activities',
          },
          {
            Header: 'Learning Hours',
            accessor: 'hours_online',
          },
          {
            Header: 'Log Views',
            accessor: 'log_viewed',
          },
        ]}
        tableActions={[
          <DownloadCsvButton
            fetchData={fetchCsvData}
            data={paginationData.data}
            testId="module-activity-download"
          />,
        ]}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.EmptyTable content="No results found" />
        <DataTable.TableFooter />
      </DataTable>
    </>
  );
};

ModuleActivityReport.propTypes = {
  enterpriseId: PropTypes.string,
};

export default ModuleActivityReport;
