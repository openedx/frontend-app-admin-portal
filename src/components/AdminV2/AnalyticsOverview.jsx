import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import AIAnalyticsSummary from './AIAnalyticsSummary';
import AIAnalyticsSummarySkeleton from './AIAnalyticsSummarySkeleton';
import AdminCards from '../../containers/AdminCardsV2';
import AdminCardsSkeleton from './AdminCardsSkeleton';
import { TRACK_LEARNER_PROGRESS_TARGETS } from '../ProductTours/AdminOnboardingTours/constants';

const AnalyticsOverview = ({
  insightsLoading,
  hasCompleteInsights,
  enterpriseId,
  error,
  loading,
  renderErrorMessage,
}) => {
  const renderOverviewHeading = () => (
    <h2>
      <FormattedMessage
        id="admin.portal.lpr.overview.heading"
        defaultMessage="Overview"
        description="Heading for the overview section of the learner progress report page"
      />
    </h2>
  );

  // If insights are loading => Loading Skeleton is displayed so we need to render overview heading
  // If we have no insights => AnalyticsSummary does not render so we need to render overview heading
  const shouldShowOverviewHeading = insightsLoading || !hasCompleteInsights;

  return (
    <div id={TRACK_LEARNER_PROGRESS_TARGETS.LPR_OVERVIEW}>
      <div className="row">
        {shouldShowOverviewHeading && (
          <div className="col">
            {renderOverviewHeading()}
          </div>
        )}
        <div className="col">
          {insightsLoading ? <AIAnalyticsSummarySkeleton />
            : (
              hasCompleteInsights && (
                <AIAnalyticsSummary
                  enterpriseId={enterpriseId}
                  renderOverviewHeading={renderOverviewHeading}
                />
              )
            )}
        </div>
      </div>
      <div className="row mt-3">
        {(error || loading) ? (
          <div className="col">
            {error && renderErrorMessage()}
            {loading && <AdminCardsSkeleton />}
          </div>
        ) : (
          <AdminCards />
        )}
      </div>
    </div>
  );
};

AnalyticsOverview.defaultProps = {
  error: null,
  loading: false,
  insightsLoading: false,
  hasCompleteInsights: false,
};

AnalyticsOverview.propTypes = {
  insightsLoading: PropTypes.bool,
  hasCompleteInsights: PropTypes.bool,
  enterpriseId: PropTypes.string.isRequired,
  error: PropTypes.instanceOf(Error),
  loading: PropTypes.bool,
  renderErrorMessage: PropTypes.func.isRequired,
};

export default AnalyticsOverview;
