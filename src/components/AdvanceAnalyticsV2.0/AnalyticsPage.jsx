import React, { useState } from 'react';
import { Tabs, Tab, Stack } from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import Hero from '../Hero';
import Engagements from './tabs/Engagements';
import Progress from './tabs/Progress';
import Outcomes from './tabs/Outcomes';
import { ANALYTICS_V2_TARGETS } from '../ProductTours/AdminOnboardingTours/constants';

const AnalyticsPage = ({ enterpriseId }) => {
  const [activeTab, setActiveTab] = useState('engagements');
  const intl = useIntl();

  const PAGE_TITLE = intl.formatMessage({
    id: 'analytics.page.title.heading',
    defaultMessage: 'Analytics',
    description: 'Title of the analytics page',
  });

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <Stack className="container-fluid w-100" gap={4}>
        <div className="tabs-container pt-3">
          <Tabs
            variant="tabs"
            activeKey={activeTab}
            onSelect={(tab) => {
              setActiveTab(tab);
            }}
          >
            <Tab
              id={ANALYTICS_V2_TARGETS.ENGAGEMENTS_TAB}
              eventKey="engagements"
              title={intl.formatMessage({
                id: 'analytics.engagement.tab.title.heading',
                defaultMessage: 'Engagement',
                description: 'Title for the engagements tab in advance analytics.',
              })}
            >
              <Engagements
                enterpriseId={enterpriseId}
              />
            </Tab>
            <Tab
              id={ANALYTICS_V2_TARGETS.PROGRESS_TAB}
              eventKey="Progress"
              title={intl.formatMessage({
                id: 'advance.analytics.progress.tab.title.heading',
                defaultMessage: 'Progress',
                description: 'Title for the progress tab in advance analytics.',
              })}
            >
              <Progress
                enterpriseId={enterpriseId}
              />
            </Tab>
            <Tab
              id={ANALYTICS_V2_TARGETS.OUTCOMES_TAB}
              eventKey="Outcomes"
              title={intl.formatMessage({
                id: 'advance.analytics.outcomes.tab.title.heading',
                defaultMessage: 'Outcomes',
                description: 'Title for the outcomes tab in advance analytics.',
              })}
            >
              <Outcomes
                enterpriseId={enterpriseId}
              />
            </Tab>
          </Tabs>
        </div>

      </Stack>
    </>
  );
};

AnalyticsPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
export default AnalyticsPage;
