import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import AIAnalyticsSummary from './AIAnalyticsSummary';
import AIAnalyticsSummarySkeleton from './AIAnalyticsSummarySkeleton';
import AdminCards from '../../containers/AdminCardsV2';
import AdminCardsSkeleton from './AdminCardsSkeleton';

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

  return (
    <>
      <div className="row">
        <div className="col">
          {insightsLoading ? <AIAnalyticsSummarySkeleton renderOverviewHeading={renderOverviewHeading} />
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
    </>
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
