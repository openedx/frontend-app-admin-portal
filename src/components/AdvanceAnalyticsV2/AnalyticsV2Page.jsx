import React, { useState } from 'react';
import {
  Form, Tabs, Tab, Stack,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import Hero from '../Hero';
import Stats from './Stats';
import Enrollments from './tabs/Enrollments';
import Engagements from './tabs/Engagements';
import Completions from './tabs/Completions';
import Leaderboard from './tabs/Leaderboard';
import Skills from './tabs/Skills';
import { useEnterpriseAnalyticsAggregatesData } from './data/hooks';
import { GRANULARITY, CALCULATION } from './data/constants';
import { formatTimestamp } from '../../utils';

const PAGE_TITLE = 'Analytics';

const AnalyticsV2Page = ({ enterpriseId }) => {
  const [activeTab, setActiveTab] = useState('enrollments');
  const [granularity, setGranularity] = useState(GRANULARITY.WEEKLY);
  const [calculation, setCalculation] = useState('Total');
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const intl = useIntl();
  const { isFetching, isError, data } = useEnterpriseAnalyticsAggregatesData({
    enterpriseCustomerUUID: enterpriseId,
    startDate,
    endDate,
  });
  const currentDate = new Date().toISOString().split('T')[0];
  const defaultDataUpdatedDate = new Date().toISOString();
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <Stack className="container-fluid w-100" gap={4}>
        <div className="row data-refresh-msg-container">
          <div className="col">
            <span>
              <FormattedMessage
                id="advance.analytics.data.refresh.msg"
                defaultMessage="Data updated on {date}"
                description="Data refresh message"
                values={{ date: formatTimestamp({ timestamp: data?.lastUpdatedAt || defaultDataUpdatedDate }) }}
              />
            </span>
          </div>
        </div>

        <div className="row filter-container">
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
                value={startDate || data?.minEnrollmentDate}
                min={data?.minEnrollmentDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isFetching}
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
                value={endDate || currentDate}
                max={currentDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isFetching}
              />
            </Form.Group>
          </div>
          <div className="col" data-testid="granularity-select">
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
                disabled={isFetching}
              >
                <option value={GRANULARITY.DAILY}>
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.granularity.option.daily',
                    defaultMessage: 'Daily',
                    description: 'Advance analytics granularity filter daily option',
                  })}
                </option>
                <option value={GRANULARITY.WEEKLY}>
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.granularity.option.weekly',
                    defaultMessage: 'Weekly',
                    description: 'Advance analytics granularity filter weekly option',
                  })}
                </option>
                <option value={GRANULARITY.MONTHLY}>
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.granularity.option.monthly',
                    defaultMessage: 'Monthly',
                    description: 'Advance analytics granularity filter monthly option',
                  })}
                </option>
                <option value={GRANULARITY.QUARTERLY}>
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
                disabled={isFetching}
              >
                <option value={CALCULATION.TOTAL}>
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.calculation.option.total',
                    defaultMessage: 'Total',
                    description: 'Advance analytics calculation filter total option',
                  })}
                </option>
                <option value={CALCULATION.RUNNING_TOTAL}>
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.calculation.option.running.total',
                    defaultMessage: 'Running Total',
                    description: 'Advance analytics calculation filter running total option',
                  })}
                </option>
                <option value={CALCULATION.MOVING_AVERAGE_3_PERIODS}>
                  {intl.formatMessage({
                    id: 'advance.analytics.filter.calculation.option.average.3',
                    defaultMessage: 'Moving Average (3 Period)',
                    description: 'Advance analytics calculation filter moving average 3 period option',
                  })}
                </option>
                <option value={CALCULATION.MOVING_AVERAGE_7_PERIODS}>
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

        <div className="row stats-container d-flex justify-content-center">
          <Stats
            data={data}
            isFetching={isFetching}
            isError={isError}
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
              <Enrollments
                startDate={startDate || data?.minEnrollmentDate}
                endDate={endDate || currentDate}
                granularity={granularity}
                calculation={calculation}
                enterpriseId={enterpriseId}
              />
            </Tab>
            <Tab
              eventKey="engagements"
              title={intl.formatMessage({
                id: 'advance.analytics.engagement.tab.title',
                defaultMessage: 'Engagements',
                description: 'Title for the engagements tab in advance analytics.',
              })}
            >
              <Engagements
                startDate={startDate || data?.minEnrollmentDate}
                endDate={endDate || currentDate}
                enterpriseId={enterpriseId}
                granularity={granularity}
                calculation={calculation}
              />
            </Tab>
            <Tab
              eventKey="completions"
              title={intl.formatMessage({
                id: 'advance.analytics.completions.tab.title',
                defaultMessage: 'Completions',
                description: 'Title for the completions tab in advance analytics.',
              })}
            >
              <Completions
                startDate={startDate || data?.minEnrollmentDate}
                endDate={endDate || currentDate}
                granularity={granularity}
                calculation={calculation}
                enterpriseId={enterpriseId}
              />
            </Tab>
            <Tab
              eventKey="leaderboard"
              title={intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.title',
                defaultMessage: 'Leaderboard',
                description: 'Title for the leaderboard tab in advance analytics.',
              })}
            >
              <Leaderboard
                startDate={startDate || data?.minEnrollmentDate}
                endDate={endDate || currentDate}
                enterpriseId={enterpriseId}
              />
            </Tab>
            <Tab
              eventKey="skills"
              title={intl.formatMessage({
                id: 'advance.analytics.skills.tab.title',
                defaultMessage: 'Skills',
                description: 'Title for the skills tab in advance analytics.',
              })}
            >
              <Skills
                startDate={startDate || data?.minEnrollmentDate}
                endDate={endDate || currentDate}
                enterpriseId={enterpriseId}
              />
            </Tab>
          </Tabs>
        </div>
      </Stack>
    </>
  );
};

AnalyticsV2Page.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
export default AnalyticsV2Page;
