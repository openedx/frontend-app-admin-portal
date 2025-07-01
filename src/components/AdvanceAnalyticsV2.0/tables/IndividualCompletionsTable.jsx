import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import AnalyticsTable from './AnalyticsTable';
import { ANALYTICS_TABS } from '../data/constants';

const IndividualCompletionsTable = ({
  startDate,
  endDate,
  enterpriseId,
  groupUUID,
}) => {
  const intl = useIntl();

  return (
    <div className="individual-completions-datatable-container mt-4">
      <div className="mb-4 rounded-lg">
        <AnalyticsTable
          name={ANALYTICS_TABS.COMPLETIONS}
          tableTitle={intl.formatMessage({
            id: 'analytics.individual.completions.table.title',
            defaultMessage: 'Individual Completions',
            description: 'Title for the individual completions datatable.',
          })}
          tableSubtitle={intl.formatMessage({
            id: 'analytics.individual.completions.table.subtitle',
            defaultMessage: 'See the individual completions from your organization.',
            description: 'Subtitle for the individual completions datatable.',
          })}
          startDate={startDate}
          endDate={endDate}
          enterpriseId={enterpriseId}
          groupUUID={groupUUID}
          enableCSVDownload
          tableColumns={[
            {
              Header: intl.formatMessage({
                id: 'analytics.individual.completions.table.column.email',
                defaultMessage: 'Email',
                description: 'Label for the email column in individual completions table',
              }),
              accessor: 'email',
            },
            {
              Header: intl.formatMessage({
                id: 'analytics.individual.completions.table.column.course.title',
                defaultMessage: 'Course Title',
                description: 'Label for the course title column in individual completions table',
              }),
              accessor: 'courseTitle',
            },
            {
              Header: intl.formatMessage({
                id: 'analytics.individual.completions.table.column.course.subject',
                defaultMessage: 'Course Subject',
                description: 'Label for the course subject column in individual completions table',
              }),
              accessor: 'courseSubject',
            },
            {
              Header: intl.formatMessage({
                id: 'analytics.individual.completions.table.column.passed.date',
                defaultMessage: 'Passed Date',
                description: 'Label for the passed date column in individual completions table',
              }),
              accessor: 'passedDate',
            },
          ]}
        />
      </div>
    </div>
  );
};

IndividualCompletionsTable.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  groupUUID: PropTypes.string,
};

IndividualCompletionsTable.defaultProps = {
  groupUUID: '',
};

export default IndividualCompletionsTable;
