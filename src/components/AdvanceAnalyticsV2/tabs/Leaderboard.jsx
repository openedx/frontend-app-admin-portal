import React, { useState, useCallback } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { DataTable, TablePaginationMinimal } from '@openedx/paragon';
import Header from '../Header';
import { ANALYTICS_TABS, analyticsDataTableKeys } from '../data/constants';

import { useEnterpriseAnalyticsTableData, usePaginatedData } from '../data/hooks';

const Leaderboard = ({ startDate, endDate, enterpriseId }) => {
  const intl = useIntl();
  const [currentPage, setCurrentPage] = useState(0);

  const {
    isLoading, data, isPreviousData,
  } = useEnterpriseAnalyticsTableData(
    enterpriseId,
    analyticsDataTableKeys.leaderboard,
    startDate,
    endDate,
    // pages index from 1 in backend, frontend components index from 0
    currentPage + 1,
  );

  const fetchData = useCallback(
    (args) => {
      if (args.pageIndex !== currentPage) {
        setCurrentPage(args.pageIndex);
      }
    },
    [currentPage],
  );

  const paginatedData = usePaginatedData(data);

  return (
    <div className="tab-leaderboard mt-4">
      <div className="leaderboard-datatable-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.leaderboard.tab.datatable.leaderboard.title',
            defaultMessage: 'Leaderboard',
            description: 'Title for the leaderboard datatable.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.leaderboard.tab.datatable.leaderboard.subtitle',
            defaultMessage: 'See the top learners by different measures of engagement. The results are defaulted to sort by learning hours. Download the full CSV below to sort by other metrics.',
            description: 'Subtitle for the leaderboard datatable.',
          })}
          startDate={startDate}
          endDate={endDate}
          activeTab={ANALYTICS_TABS.LEADERBOARD}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <DataTable
          isLoading={isLoading || isPreviousData}
          isPaginated
          manualPagination
          initialState={{
            pageSize: 50,
            pageIndex: 0,
          }}
          itemCount={paginatedData.itemCount}
          pageCount={paginatedData.pageCount}
          fetchData={fetchData}
          data={paginatedData.data}
          columns={[
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.username',
                defaultMessage: 'Email',
                description: 'Header for the email column in leaderboard table',
              }),
              accessor: 'email',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.course',
                defaultMessage: 'Learning Hours',
                description: 'Header for the learning hours column in the leaderboard table',
              }),
              accessor: 'learning_time_hours',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.module',
                defaultMessage: 'Daily Sessions',
                description: 'Header for the daily sessions column in the leaderboard table',

              }),
              accessor: 'daily_sessions',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.moduleGrade',
                defaultMessage: 'Average Session Length (Hours)',
                description: 'Header for the average session length column in the leaderboard table',

              }),
              accessor: 'average_session_length',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.percentageCompletedActivities',
                defaultMessage: 'Course Completions',
                description: 'Header for the course completions column in the leaderboard table',
              }),
              accessor: 'course_completions',
            },
          ]}
        >
          <DataTable.TableControlBar />
          <DataTable.Table />
          <DataTable.EmptyTable
            content={intl.formatMessage({
              id: 'advance.analytics.leaderboard.tab.table.empty',
              defaultMessage: 'No results found.',
              description: 'Message displayed when the module activity report table is empty',
            })}
          />
          <DataTable.TableFooter>
            <TablePaginationMinimal />
          </DataTable.TableFooter>
        </DataTable>
      </div>
    </div>
  );
};

Leaderboard.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};

export default Leaderboard;
