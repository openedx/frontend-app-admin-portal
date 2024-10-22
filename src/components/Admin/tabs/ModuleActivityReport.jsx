import React, { useState, useCallback } from 'react';
import { DataTable } from '@openedx/paragon';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
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
  const intl = useIntl();

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
        placeholder={intl.formatMessage({
          id: 'adminPortal.LPR.moduleActivityReport.search.placeholder',
          defaultMessage: 'Search email or course title',
          description: 'Placeholder text for the search input in the module activity report page.',
        })}
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
            Header: intl.formatMessage({
              id: 'adminPortal.LPR.moduleActivityReport.table.header.username',
              defaultMessage: 'Email',
              description: 'Header for the email column in the module activity report table',
            }),
            accessor: 'username',
          },
          {
            Header: intl.formatMessage({
              id: 'adminPortal.LPR.moduleActivityReport.table.header.course',
              defaultMessage: 'Course Title',
              description: 'Header for the course title column in the module activity report table',
            }),
            accessor: 'course_name',
          },
          {
            Header: intl.formatMessage({
              id: 'adminPortal.LPR.moduleActivityReport.table.header.module',
              defaultMessage: 'Module',
              description: 'Header for the module title column in the module activity report table',

            }),
            accessor: 'module_name',
          },
          {
            Header: intl.formatMessage({
              id: 'adminPortal.LPR.moduleActivityReport.table.header.moduleGrade',
              defaultMessage: 'Grade',
              description: 'Header for the module grade column in the module activity report table',

            }),
            accessor: 'module_grade',
          },
          {
            Header: intl.formatMessage({
              id: 'adminPortal.LPR.moduleActivityReport.table.header.percentageCompletedActivities',
              defaultMessage: '% Activities Complete',
              description: 'Header for the percentage of activities completed column in the module activity report table',
            }),
            accessor: 'percentage_completed_activities',
          },
          {
            Header: intl.formatMessage({
              id: 'adminPortal.LPR.moduleActivityReport.table.header.extensionsRequested',
              defaultMessage: 'Extension Requests',
              description: 'Header for the extensions requested column in the module activity report table',
            }),
            accessor: 'extensions_requested',
          },
          {
            Header: intl.formatMessage({
              id: 'adminPortal.LPR.moduleActivityReport.table.header.hoursOnline',
              defaultMessage: 'Learning Hours',
              description: 'Header for the learning hours column in the module activity report table',
            }),
            accessor: 'hours_online',
          },
          {
            Header: intl.formatMessage({
              id: 'adminPortal.LPR.moduleActivityReport.table.header.logViewed',
              defaultMessage: 'Log Views',
              description: 'Header for the log views column in the module activity report table',
            }),
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
        <DataTable.EmptyTable
          content={intl.formatMessage({
            id: 'adminPortal.LPR.moduleActivityReport.table.empty',
            defaultMessage: 'No results found.',
            description: 'Message displayed when the module activity report table is empty',
          })}
        />
        <DataTable.TableFooter />
      </DataTable>
    </>
  );
};

ModuleActivityReport.propTypes = {
  enterpriseId: PropTypes.string,
};

export default ModuleActivityReport;
