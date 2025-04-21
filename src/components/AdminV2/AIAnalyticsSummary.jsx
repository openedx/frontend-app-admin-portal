import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button, Card, Stack, Badge, useToggle,
} from '@openedx/paragon';
import { FormattedMessage, defineMessages } from '@edx/frontend-platform/i18n';
import { AutoFixHigh, Groups } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import useAIAnalyticsSummary from '../AIAnalyticsSummary/data/hooks';

export const SUMMARIZE_ANALYTICS_CLICK_SEGMENT_EVENT_NAME = 'edx.ui.enterprise.admin_portal.summarize_analytics.clicked';
const ENABLE_TRACK_PROGRESS = false;

const AnalyticsDetailCard = ({
  onClose,
  isLoading,
  error,
  data,
}) => {
  const messages = defineMessages({
    errorMessage: {
      id: 'adminPortal.analyticsCardText.errorMessage',
      defaultMessage: 'We encountered an issue while fetching analytics data. Kindly try again later or contact support for assistance. (Error: {error_message})',
      description: 'Message shown to the user in case of error returned byt analytics API.',
      values: { error_message: error?.message },
    },
    noContentErrorMessage: {
      id: 'adminPortal.analyticsCardText.noContentErrorMessage',
      defaultMessage: 'Analytics not found.',
      description: 'Message shown to the user in case of empty response returned byt analytics API.',
    },
  });

  return (
    <Card className="mt-3 mb-4" isLoading={isLoading}>
      <Card.Section>
        <Badge variant="light" className="mb-3 font-weight-semibold">
          <FormattedMessage id="adminPortal.analyticsCardBetaButton" defaultMessage="Beta" />
        </Badge>
        <Stack gap={1} direction="horizontal">
          <p className="card-text text-justify small">
            {
              error ? (
                <FormattedMessage {...messages.errorMessage} />
              ) : (
                data || <FormattedMessage {...messages.noContentErrorMessage} />
              )
            }
          </p>
          <Button variant="link" className="mb-4 ml-3" onClick={onClose}>
            <span className="small font-weight-bold text-gray-800">Dismiss</span>
          </Button>
        </Stack>
        <div className="x-small">
          <FormattedMessage id="adminPortal.analyticsCardPoweredBylabel" defaultMessage="Powered by OpenAI" />
        </div>
      </Card.Section>
    </Card>
  );
};

AnalyticsDetailCard.propTypes = {
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  data: PropTypes.string,
};

const AIAnalyticsSummary = ({ enterpriseId, insights, renderOverviewHeading }) => {
  const [summarizeCardIsOpen, showSummarizeCard, hideSummarizeCard] = useToggle(false);
  const [trackProgressCardIsOpen, showTrackProgressCard, hideTrackProgressCard] = useToggle(false);

  const { data: analyticsSummary, isLoading, error } = useAIAnalyticsSummary(enterpriseId, insights);

  return (
    <>
      <Stack gap={3} direction="horizontal" className="justify-content-between">
        {renderOverviewHeading()}

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
            <FormattedMessage id="adminPortal.v2.summarizeAnalytics" defaultMessage="Summarize analytics" />
          </>
        </Button>
        {/* Track Progress is currently hidden due to data inconsistency. It will be addressed as part of ENT-7812 */}
        {ENABLE_TRACK_PROGRESS && (
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
        )}
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
  renderOverviewHeading: PropTypes.func,
};

export default connect(mapStateToProps)(AIAnalyticsSummary);
