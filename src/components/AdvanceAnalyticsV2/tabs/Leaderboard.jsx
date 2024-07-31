import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import EmptyChart from '../charts/EmptyChart';
import Header from '../Header';

const Leaderboard = () => {
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
        />
        <EmptyChart />
      </div>
    </div>
  );
};

export default Leaderboard;
