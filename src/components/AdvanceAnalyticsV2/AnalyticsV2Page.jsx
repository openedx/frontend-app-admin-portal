import React, { useState } from 'react';
import {
  Form, Tabs, Tab,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import Hero from '../Hero';
import Stats from './Stats';
import Enrollments from './tabs/Enrollments';
import Engagements from './tabs/Engagements';
import Completions from './tabs/Completions';
import Leaderboard from './tabs/Leaderboard';
import Skills from './tabs/Skills';

const PAGE_TITLE = 'AnalyticsV2';

const AnalyticsV2Page = () => {
  const [activeTab, setActiveTab] = useState('enrollments');
  const [granularity, setGranularity] = useState('daily');
  const [calculation, setCalculation] = useState('total');
  const dataRefreshDate = '';
  const intl = useIntl();

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <div className="container-fluid w-100">
        <div className="row data-refresh-msg-container mb-4">
          <div className="col">
            <span>
              <FormattedMessage
                id="advance.analytics.data.refresh.msg"
                defaultMessage="Data updated on {date}"
                description="Data refresh message"
                values={{ date: dataRefreshDate }}
              />
            </span>
          </div>
        </div>

        <div className="row filter-container mb-4">
          <div className="col">
            <Form.Group>
              <Form.Label>
                <FormattedMessage
                  id="advance.analytics.filter.start.date"
                  defaultMessage="Start Date"
                  description="Advance analytics Start date filter label"
                />
              </Form.Label>
              <Form.Control
                type="date"
              />
            </Form.Group>
          </div>
          <div className="col">
            <Form.Group>
              <Form.Label>
                <FormattedMessage
                  id="advance.analytics.filter.end.date"
                  defaultMessage="End Date"
                  description="Advance analytics End date filter label"
                />
              </Form.Label>
              <Form.Control
                type="date"
              />
            </Form.Group>
          </div>
          <div className="col">
            <Form.Group>
              <Form.Label>
                <FormattedMessage
                  id="advance.analytics.filter.date.granularity"
                  defaultMessage="Date granularity"
                  description="Advance analytics Date granularity filter label"
                />
              </Form.Label>
              <Form.Control
                as="select"
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
              >
                <option value="daily">
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.granularity.option.daily',
                    defaultMessage: 'Daily',
                    description: 'Advance analytics granularity filter daily option',
                  })}
                </option>
                <option value="weekly">
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.granularity.option.weekly',
                    defaultMessage: 'Weekly',
                    description: 'Advance analytics granularity filter weekly option',
                  })}
                </option>
                <option value="monthly">
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.granularity.option.monthly',
                    defaultMessage: 'Monthly',
                    description: 'Advance analytics granularity filter monthly option',
                  })}
                </option>
                <option value="quarterly">
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.granularity.option.quarterly',
                    defaultMessage: 'Quarterly',
                    description: 'Advance analytics granularity filter quarterly option',
                  })}
                </option>
              </Form.Control>
            </Form.Group>
          </div>
          <div className="col">
            <Form.Group>
              <Form.Label>
                <FormattedMessage
                  id="advance.analytics.filter.calculation"
                  defaultMessage="Calculation"
                  description="Advance analytics Calculation filter label"
                />
              </Form.Label>
              <Form.Control
                as="select"
                value={calculation}
                onChange={(e) => setCalculation(e.target.value)}
              >
                <option value="total">
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.calculation.option.total',
                    defaultMessage: 'Total',
                    description: 'Advance analytics calculation filter total option',
                  })}
                </option>
                <option value="running_total">
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.calculation.option.running.total',
                    defaultMessage: 'Running Total',
                    description: 'Advance analytics calculation filter running total option',
                  })}
                </option>
                <option value="average_3">
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.calculation.option.average.3',
                    defaultMessage: 'Moving Average (3 Period)',
                    description: 'Advance analytics calculation filter moving average 3 period option',
                  })}
                </option>
                <option value="average_7">
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.calculation.option.average.7',
                    defaultMessage: 'Moving Average (7 Period)',
                    description: 'Advance analytics calculation filter moving average 7 period option',
                  })}
                </option>
              </Form.Control>
            </Form.Group>
          </div>
        </div>

        <div className="row stats-container mb-4">
          <Stats
            enrollments={0}
            distinctCourses={0}
            dailySessions={0}
            learningHours={0}
            completions={0}
          />
        </div>

        <div className="tabs-container">
          <Tabs
            variant="tabs"
            activeKey={activeTab}
            onSelect={(tab) => {
              setActiveTab(tab);
            }}
          >
            <Tab
              eventKey="enrollments"
              title={intl.formatMessage({
                id: 'advance.analytics.enrollment.tab.title',
                defaultMessage: 'Enrollments',
                description: 'Title for the enrollments tab in advance analytics.',
              })}
            >
              <Enrollments />
            </Tab>
            <Tab
              eventKey="engagements"
              title={intl.formatMessage({
                id: 'advance.analytics.engagement.tab.title',
                defaultMessage: 'Engagements',
                description: 'Title for the engagements tab in advance analytics.',
              })}
            >
              <Engagements />
            </Tab>
            <Tab
              eventKey="completions"
              title={intl.formatMessage({
                id: 'advance.analytics.completions.tab.title',
                defaultMessage: 'Completions',
                description: 'Title for the completions tab in advance analytics.',
              })}
            >
              <Completions />
            </Tab>
            <Tab
              eventKey="leaderboard"
              title={intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.title',
                defaultMessage: 'Leaderboard',
                description: 'Title for the leaderboard tab in advance analytics.',
              })}
            >
              <Leaderboard />
            </Tab>
            <Tab
              eventKey="skills"
              title={intl.formatMessage({
                id: 'advance.analytics.skills.tab.title',
                defaultMessage: 'Skills',
                description: 'Title for the skills tab in advance analytics.',
              })}
            >
              <Skills />
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AnalyticsV2Page;
