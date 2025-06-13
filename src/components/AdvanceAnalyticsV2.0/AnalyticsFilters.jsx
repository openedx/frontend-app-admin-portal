import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import React, { useState } from 'react';
import { Form, IconButton, Icon } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { GRANULARITY, CALCULATION } from './data/constants';

export const DEFAULT_GROUP = '';

const AnalyticsFilters = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  granularity,
  setGranularity,
  calculation,
  setCalculation,
  groupUUID,
  setGroupUUID,
  currentDate,
  data,
  groups,
  isFetching,
  isGroupsLoading,
}) => {
  const intl = useIntl();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`container-fluid bg-primary-100 rounded-lg p-3 mb-2 position-relative analytics-filter-container ${
      collapsed ? 'collapsed' : ''
    }`}
    >
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="font-weight-bold mb-0">
          <FormattedMessage
            id="advance.analytics.filters.heading"
            defaultMessage="Date range and filters"
            description="Heading for advanced analytics filters"
          />
        </h3>

        <IconButton
          aria-label={collapsed ? 'Expand filters' : 'Collapse filters'}
          onClick={() => setCollapsed(!collapsed)}
          variant="default"
          src={collapsed ? ExpandMore : ExpandLess}
          iconAs={Icon}
          className="p-0"
          size="lg"
        />
      </div>

      {!collapsed && (
        <>
          <div className="row filter-container mt-2">
            <div className="col">
              <Form.Group>
                <Form.Label className="font-weight-normal">
                  <FormattedMessage
                    id="advance.analytics.filter.date.range.options"
                    defaultMessage="Date range options"
                    description="Advance analytics date range option filter label"
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                  as="select"
                  disabled
                  defaultValue=""
                >
                  <option value="">Custom</option>
                </Form.Control>
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group>
                <Form.Label className="font-weight-normal">
                  <FormattedMessage
                    id="advance.analytics.date.filter.start.date"
                    defaultMessage="Start date"
                    description="Advance analytics Start date filter label"
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                  type="date"
                  value={startDate || data?.minEnrollmentDate || ''}
                  min={data?.minEnrollmentDate || ''}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isFetching}
                />
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group>
                <Form.Label className="font-weight-normal">
                  <FormattedMessage
                    id="advance.analytics.date.filter.end.date"
                    defaultMessage="End date"
                    description="Advance analytics End date filter label"
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                  type="date"
                  value={endDate || currentDate || ''}
                  max={currentDate || ''}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isFetching}
                />
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group>
                <Form.Label>
                  <FormattedMessage
                    id="advance.analytics.calculation.filter"
                    defaultMessage="Calculation / Trends"
                    description="Advance analytics Calculation filter label"
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                  as="select"
                  value={calculation}
                  onChange={(e) => setCalculation(e.target.value)}
                  disabled={isFetching}
                >
                  <option value={CALCULATION.TOTAL}>
                    {intl.formatMessage({
                      id: 'advance.analytics.calculation.filter.option.total',
                      defaultMessage: 'Total',
                      description: 'Advance analytics calculation filter total option',
                    })}
                  </option>
                  <option value={CALCULATION.RUNNING_TOTAL}>
                    {intl.formatMessage({
                      id: 'advance.analytics.calculation.filter.option.running.total',
                      defaultMessage: 'Running Total',
                      description: 'Advance analytics calculation filter running total option',
                    })}
                  </option>
                  <option value={CALCULATION.MOVING_AVERAGE_3_PERIODS}>
                    {intl.formatMessage({
                      id: 'advance.analytics.calculation.filter.option.average.3',
                      defaultMessage: 'Moving Average (3 Period)',
                      description: 'Advance analytics calculation filter moving average 3 period option',
                    })}
                  </option>
                  <option value={CALCULATION.MOVING_AVERAGE_7_PERIODS}>
                    {intl.formatMessage({
                      id: 'advance.analytics.calculation.filter.option.average.7',
                      defaultMessage: 'Moving Average (7 Period)',
                      description: 'Advance analytics calculation filter moving average 7 period option',
                    })}
                  </option>
                </Form.Control>
              </Form.Group>
            </div>
          </div>
          <div className="row filter-container">
            <div className="col" data-testid="granularity-select">
              <Form.Group>
                <Form.Label>
                  <FormattedMessage
                    id="advance.analytics.filter.date.granularity"
                    defaultMessage="Date granularity"
                    description="Advance analytics data granularity filter label"
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
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
            <div className="col" data-testid="group-select">
              <Form.Group>
                <Form.Label className="font-weight-normal">
                  <FormattedMessage
                    id="advance.analytics.filter.by.group"
                    defaultMessage="Filter by group"
                    description="Advance analytics group filter label"
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                  as="select"
                  value={groupUUID}
                  onChange={(e) => setGroupUUID(e.target.value)}
                  disabled={isGroupsLoading || groups === undefined || groups.length === 0}
                >
                  <option value={DEFAULT_GROUP}>
                    {intl.formatMessage({
                      id: 'adminPortal.analytics.group.filter.all',
                      defaultMessage: 'All groups',
                      description: 'Label for the all groups option',
                    })}
                  </option>
                  {groups?.map(grp => (
                    <option value={grp.uuid} key={grp.uuid}>
                      {grp.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group>
                <Form.Label className="font-weight-normal">
                  <FormattedMessage
                    id="advance.analytics.filter.by.budget"
                    defaultMessage="Filter by budget"
                    description="Advance analytics filter by budget label"
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                  as="select"
                  disabled
                  value=""
                >
                  <option value="">All budgets</option>
                </Form.Control>
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group>
                <Form.Label className="font-weight-normal">
                  <FormattedMessage
                    id="advance.analytics.filter.by.course"
                    defaultMessage="Filter by course"
                    description="Advance analytics filter by course label"
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                  as="select"
                  disabled
                  value=""
                >
                  <option value="">All courses</option>
                </Form.Control>
              </Form.Group>
            </div>
          </div>
          <div className="row filter-container pb-2">
            <div className="col-3">
              <Form.Group>
                <Form.Label className="font-weight-normal">
                  <FormattedMessage
                    id="advance.analytics.filter.by.course.type"
                    defaultMessage="Filter by course type"
                    description="Advance analytics filter by course type label"
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                  as="select"
                  disabled
                  value=""
                >
                  <option value="">All course types</option>
                </Form.Control>
              </Form.Group>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

AnalyticsFilters.propTypes = {
  startDate: PropTypes.string,
  setStartDate: PropTypes.func.isRequired,
  endDate: PropTypes.string,
  setEndDate: PropTypes.func.isRequired,
  granularity: PropTypes.string.isRequired,
  setGranularity: PropTypes.func.isRequired,
  calculation: PropTypes.string.isRequired,
  setCalculation: PropTypes.func.isRequired,
  groupUUID: PropTypes.string,
  setGroupUUID: PropTypes.func.isRequired,
  currentDate: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  groups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isFetching: PropTypes.bool.isRequired,
  isGroupsLoading: PropTypes.bool.isRequired,
};

export default AnalyticsFilters;
