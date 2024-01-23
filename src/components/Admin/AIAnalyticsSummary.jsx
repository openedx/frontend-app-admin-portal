import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button, Card, Stack, Badge, useToggle,
} from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AutoFixHigh, Groups } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import useAIAnalyticsSummary from '../AIAnalyticsSummary/data/hooks';

export const SUMMARIZE_ANALYTICS_CLICK_SEGMENT_EVENT_NAME = 'edx.ui.enterprise.admin_portal.summarize_analytics.clicked';
const AnalyticsDetailCard = ({
  onClose,
  isLoading,
  error,
  data,
}) => (
  <Card className="mt-3 mb-4" isLoading={isLoading}>
    <Card.Section>
      <Badge variant="light" className="mb-3 font-weight-semibold">
        <FormattedMessage id="adminPortal.analyticsCardBetaButton" defaultMessage="Beta" />
      </Badge>
      <Stack gap={1} direction="horizontal">
        <p className="card-text text-justify small">
          <FormattedMessage
            id="adminPortal.analyticsCardText"
            defaultMessage={
              error
                ? `An error occurred: ${error.message}`
                : data || 'Analytics not found.'
            }
          />
        </p>
        <Button variant="link" className="mb-4 ml-3" onClick={onClose}>
          <span className="small font-weight-bold text-gray-800">Dismiss</span>
        </Button>
      </Stack>
      <label className="x-small" htmlFor="poweredBylabel">
        <FormattedMessage id="adminPortal.analyticsCardPoweredBylabel" defaultMessage="Powered by OpenAI" />
      </label>
    </Card.Section>
  </Card>
);

AnalyticsDetailCard.propTypes = {
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  data: PropTypes.string,
};

const AIAnalyticsSummary = ({ enterpriseId, insights }) => {
  const [summarizeCardIsOpen, showSummarizeCard, hideSummarizeCard] = useToggle(false);
  const [trackProgressCardIsOpen, showTrackProgressCard, hideTrackProgressCard] = useToggle(false);

  const { data: analyticsSummary, isLoading, error } = useAIAnalyticsSummary(enterpriseId, insights);

  return (
    <>
      <Stack gap={3} direction="horizontal">
        <Button
          variant="outline-primary"
          className="d-sm-inline"
          onClick={() => {
            showSummarizeCard(true);
            hideTrackProgressCard(true);
            sendEnterpriseTrackEvent(enterpriseId, SUMMARIZE_ANALYTICS_CLICK_SEGMENT_EVENT_NAME);
          }}
          data-testid="summarize-analytics"
        >
          <>
            <AutoFixHigh className="mr-2" />
            <FormattedMessage id="adminPortal.summarizeAnalytics" defaultMessage="Summarize Analytics" />
          </>
        </Button>
        {/* Track Progress is currently hidden due to data inconsistency. It will be addressed as part of ENT-7812 */}
        <Button
          variant="outline-primary"
          className="d-none"
          onClick={() => {
            showTrackProgressCard(true);
            hideSummarizeCard(true);
          }}
          data-testid="track-progress"
        >
          <>
            <Groups className="mr-2" />
            <FormattedMessage id="adminPortal.trackProgress" defaultMessage="Track Progress" />
          </>
        </Button>
      </Stack>
      {summarizeCardIsOpen && (
        <AnalyticsDetailCard
          data={analyticsSummary?.learner_engagement}
          onClose={() => hideSummarizeCard(true)}
          isLoading={isLoading}
          error={error}
        />
      )}
      {trackProgressCardIsOpen && (
        <AnalyticsDetailCard
          data={analyticsSummary?.learner_progress}
          onClose={() => hideTrackProgressCard(true)}
          isLoading={isLoading}
          error={error}
        />
      )}
    </>
  );
};

const mapStateToProps = state => ({
  insights: state.dashboardInsights.insights,
});

AIAnalyticsSummary.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  insights: PropTypes.objectOf(PropTypes.shape),
};

export default connect(mapStateToProps)(AIAnalyticsSummary);
