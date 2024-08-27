import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import EmptyChart from '../charts/EmptyChart';
import Header from '../Header';
import { ANALYTICS_TABS } from '../data/constants';

const Leaderboard = ({ startDate, endDate, enterpriseId }) => {
  const intl = useIntl();

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
        <EmptyChart />
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
