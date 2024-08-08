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
  const { isLoading, error, paginationData } = useModuleActivityReport({
    enterpriseId, page: currentPage, filters: currentFilters,
  });

  const fetchData = useCallback(
    (args) => {
      let newFilters = { search: searchQuery };
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
    [currentFilters, currentPage, setCurrentFilters, setCurrentPage, searchQuery],
  );

  const fetchCsvData = async () => EnterpriseDataApiService.fetchEnterpriseModuleActivityReport(
    enterpriseId,
    currentFilters,
    { csv: true },
  );

  const selectColumn = {
    id: 'selection',
    Header: DataTable.ControlledSelectHeader,
    Cell: DataTable.ControlledSelect,
    disableSortBy: true,
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <SearchBar onSearch={setSearchQuery} />
      <DataTable
        isLoading={isLoading}
        manualSelectColumn={selectColumn}
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
