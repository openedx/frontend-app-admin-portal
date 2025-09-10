import { ExpandLess, ExpandMore, Info } from '@openedx/paragon/icons';
import React, { useState } from 'react';
import { Form, IconButton, Icon } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import IconWithTooltip from '../IconWithTooltip';
import {
  GRANULARITY, CALCULATION, DATE_RANGE, COURSE_TYPES,
} from './data/constants';
import { get90DayPriorDate } from './data/utils';
import CourseFilterDropdown from './CourseFilterDropdown';

export const DEFAULT_GROUP = '';

const AnalyticsFilters = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  courseType,
  setCourseType,
  course,
  setCourse,
  granularity,
  setGranularity,
  calculation,
  setCalculation,
  groupUUID,
  setGroupUUID,
  currentDate,
  groups,
  isGroupsLoading,
  budgets,
  isBudgetsFetching,
  activeTab,
  isEnterpriseCoursesFetching,
  enterpriseCourses,
  budgetUUID,
  setBudgetUUID,

}) => {
  const intl = useIntl();
  const [collapsed, setCollapsed] = useState(false);
  const isProgressOrOutcomesTab = activeTab === 'progress' || activeTab === 'outcomes';
  const [dateRangeValue, setDateRangeValue] = useState(DATE_RANGE.LAST_90_DAYS);

  const handleDateRangeChange = (selectedRange) => {
    setDateRangeValue(selectedRange);
    const today = new Date();
    const rangeMap = {
      [DATE_RANGE.LAST_7_DAYS]: 7,
      [DATE_RANGE.LAST_30_DAYS]: 30,
      [DATE_RANGE.LAST_90_DAYS]: 90,
      [DATE_RANGE.YEAR_TO_DATE]: 365,
      [DATE_RANGE.CUSTOM]: 0,
    };
    if (rangeMap[selectedRange] || rangeMap[selectedRange] === 0) {
      const newStartDate = new Date(today.setDate(today.getDate() - rangeMap[selectedRange]))
        .toISOString()
        .split('T')[0];
      setStartDate(newStartDate);
    }
    const newEndDate = new Date().toISOString().split('T')[0];
    setEndDate(newEndDate);
  };

  const handleStartDateChange = (selectedDate) => {
    setStartDate(selectedDate);
    setDateRangeValue(DATE_RANGE.CUSTOM);
  };

  const handleEndDateChange = (selectedDate) => {
    setEndDate(selectedDate);
    setDateRangeValue(DATE_RANGE.CUSTOM);
  };

  return (
    <div className={`container-fluid bg-primary-100 rounded-lg p-3 mb-2 position-relative analytics-filter-container ${collapsed ? 'collapsed' : ''}`}>
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
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  defaultValue={dateRangeValue}
                  value={dateRangeValue}
                >
                  <option value={DATE_RANGE.LAST_7_DAYS}>
                    {intl.formatMessage({
                      id: 'advance.analytics.date.range.filter.option.last.7.days',
                      defaultMessage: 'Last 7 days',
                      description: 'Option for last 7 days in date range filter in the admin portal analytics page',
                    })}
                  </option>
                  <option value={DATE_RANGE.LAST_30_DAYS}>
                    {intl.formatMessage({
                      id: 'advance.analytics.date.range.filter.option.last.30.days',
                      defaultMessage: 'Last 30 days',
                      description: 'Option for last 30 days in date range filter in the admin portal analytics page',
                    })}
                  </option>
                  <option value={DATE_RANGE.LAST_90_DAYS}>
                    {intl.formatMessage({
                      id: 'advance.analytics.date.range.filter.option.last.90.days',
                      defaultMessage: 'Last 90 days',
                      description: 'Option for last 90 days in date range filter in the admin portal analytics page',
                    })}
                  </option>
                  <option value={DATE_RANGE.YEAR_TO_DATE}>
                    {intl.formatMessage({
                      id: 'advance.analytics.date.range.filter.option.year.to.date',
                      defaultMessage: 'Year to date',
                      description: 'Option for year to date in date range filter in the admin portal analytics page',
                    })}
                  </option>
                  <option value={DATE_RANGE.CUSTOM}>
                    {intl.formatMessage({
                      id: 'advance.analytics.date.range.filter.option.custom',
                      defaultMessage: 'Custom',
                      description: 'Option for custom date in date range filter in the admin portal analytics page',
                    })}
                  </option>
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
                  value={startDate || get90DayPriorDate()}
                  onChange={(e) => handleStartDateChange(e.target.value)}
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
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
              </Form.Group>
            </div>

            {!isProgressOrOutcomesTab && (
              <div className="col">
                <Form.Group>
                  <Form.Label>
                    <FormattedMessage
                      id="advance.analytics.calculation.filter"
                      defaultMessage="Calculation / Trends"
                    />
                  </Form.Label>
                  <Form.Control
                    controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                    as="select"
                    value={calculation}
                    onChange={(e) => setCalculation(e.target.value)}
                  >
                    <option value={CALCULATION.TOTAL}>
                      {intl.formatMessage({
                        id: 'advance.analytics.calculation.filter.option.total',
                        defaultMessage: 'Total',
                      })}
                    </option>
                    <option value={CALCULATION.RUNNING_TOTAL}>
                      {intl.formatMessage({
                        id: 'advance.analytics.calculation.filter.option.running.total',
                        defaultMessage: 'Running Total',
                      })}
                    </option>
                    <option value={CALCULATION.MOVING_AVERAGE_3_PERIODS}>
                      {intl.formatMessage({
                        id: 'advance.analytics.calculation.filter.option.average.3',
                        defaultMessage: 'Moving Average (3 Period)',
                      })}
                    </option>
                    <option value={CALCULATION.MOVING_AVERAGE_7_PERIODS}>
                      {intl.formatMessage({
                        id: 'advance.analytics.calculation.filter.option.average.7',
                        defaultMessage: 'Moving Average (7 Period)',
                      })}
                    </option>
                  </Form.Control>
                </Form.Group>
              </div>
            )}
          </div>

          <div className="row filter-container">
            {!isProgressOrOutcomesTab && (
              <div className="col" data-testid="granularity-select">
                <Form.Group>
                  <Form.Label>
                    <FormattedMessage
                      id="advance.analytics.date.granularity.filter"
                      defaultMessage="Date granularity"
                    />
                  </Form.Label>
                  <Form.Control
                    controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                    as="select"
                    value={granularity}
                    onChange={(e) => setGranularity(e.target.value)}
                  >
                    <option value={GRANULARITY.DAILY}>
                      {intl.formatMessage({
                        id: 'advance.analytics.filter.granularity.option.label.daily',
                        defaultMessage: 'Daily',
                      })}
                    </option>
                    <option value={GRANULARITY.WEEKLY}>
                      {intl.formatMessage({
                        id: 'advance.analytics.filter.granularity.option.label.weekly',
                        defaultMessage: 'Weekly',
                      })}
                    </option>
                    <option value={GRANULARITY.MONTHLY}>
                      {intl.formatMessage({
                        id: 'advance.analytics.filter.granularity.option.label.monthly',
                        defaultMessage: 'Monthly',
                      })}
                    </option>
                    <option value={GRANULARITY.QUARTERLY}>
                      {intl.formatMessage({
                        id: 'advance.analytics.filter.granularity.option.label.quarterly',
                        defaultMessage: 'Quarterly',
                      })}
                    </option>
                  </Form.Control>
                </Form.Group>
              </div>
            )}

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
                  disabled={isGroupsLoading}
                >
                  <option value={DEFAULT_GROUP}>
                    {intl.formatMessage({
                      id: 'adminPortal.analytics.group.filter.all',
                      defaultMessage: 'All groups',
                      description: 'Label for the all groups option',
                    })}
                  </option>
                  {groups?.map(grp => (
                    <option value={grp?.uuid} key={grp?.uuid}>
                      {grp?.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>

            {!isProgressOrOutcomesTab && (
              <div className="col">
                <Form.Group>
                  <Form.Label className="font-weight-normal">
                    <FormattedMessage
                      id="advance.analytics.filter.by.budget"
                      defaultMessage="Filter by budget"
                      description="Advance analytics budget filter label"
                    />
                  </Form.Label>
                  <Form.Control
                    controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                    as="select"
                    value={budgetUUID}
                    onChange={(e) => setBudgetUUID(e.target.value)}
                    disabled={isBudgetsFetching}
                  >
                    <option value="">
                      {intl.formatMessage({
                        id: 'adminPortal.analytics.budget.filter.all',
                        defaultMessage: 'All budgets',
                        description: 'Label for the all budgets option',
                      })}
                    </option>
                    {budgets?.map(budget => (
                      <option
                        key={budget?.subsidyAccessPolicyUuid}
                        value={budget?.subsidyAccessPolicyUuid}
                      >
                        {budget?.subsidyAccessPolicyDisplayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
            )}

            <div className="col">
              <CourseFilterDropdown
                isFetching={isEnterpriseCoursesFetching}
                enterpriseCourses={enterpriseCourses}
                selectedCourse={course}
                onChange={setCourse}
              />
            </div>

            {isProgressOrOutcomesTab && (
            <div className="col">
              <Form.Group>
                <Form.Label className="font-weight-normal d-flex align-items-center">
                  <span>
                    <FormattedMessage
                      id="advance.analytics.filter.by.course.starte.date"
                      defaultMessage="Filter by start date"
                      description="Advance analytics filter by course type label"
                    />
                  </span>
                  <IconWithTooltip
                    data-testid="progress-tooltip-icon"
                    icon={Info}
                    altText={intl.formatMessage({
                      id: 'advance.analytics.filter.by.start.date.alt.text',
                      defaultMessage: 'More information',
                      description: 'Alt text for the info icon in the start date filter dropdown in the admin portal analytics page.',
                    })}
                    tooltipText={intl.formatMessage({
                      id: 'advance.analytics.filter.by.start.date.dropdown.tooltip',
                      defaultMessage: 'Filter by the selected course start date',
                      description: 'Tooltip text for the start date filter dropdown in the admin portal analytics page.',
                    })}
                  />
                </Form.Label>
                <Form.Control
                  controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                  as="select"
                  disabled
                  value=""
                >
                  <option value="">Choose a course</option>
                </Form.Control>
              </Form.Group>
            </div>
            )}
          </div>

          {!isProgressOrOutcomesTab && (
            <div className="row filter-container pb-2">
              <div className="col-3">
                <Form.Group>
                  <Form.Label className="font-weight-normal">
                    <FormattedMessage
                      id="advance.analytics.filter.by.course.type"
                      defaultMessage="Filter by course type"
                    />
                  </Form.Label>
                  <Form.Control
                    controlClassName="font-weight-normal analytics-filter-form-controls rounded-0"
                    as="select"
                    onChange={(e) => setCourseType(e.target.value)}
                    defaultValue={COURSE_TYPES.ALL_COURSE_TYPES}
                    value={courseType}
                  >
                    <option value={COURSE_TYPES.OPEN_COURSES}>
                      {intl.formatMessage({
                        id: 'advance.analytics.course.type.filter.option.open.courses',
                        defaultMessage: 'Open Courses',
                        description: 'Option for open courses in course type filter in the admin portal analytics page',
                      })}
                    </option>
                    <option value={COURSE_TYPES.EXECUTIVE_EDUCATION}>
                      {intl.formatMessage({
                        id: 'advance.analytics.course.type.filter.option.executive.education',
                        defaultMessage: 'Executive Education',
                        description: 'Option for executive education in course type filter in the admin portal analytics page',
                      })}
                    </option>
                    <option value={COURSE_TYPES.ALL_COURSE_TYPES}>
                      {intl.formatMessage({
                        id: 'advance.analytics.course.type.filter.option.all.courses',
                        defaultMessage: 'All Courses',
                        description: 'Option for all courses in course type filter in the admin portal analytics page',
                      })}
                    </option>
                  </Form.Control>
                </Form.Group>
              </div>
            </div>
          )}
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
  courseType: PropTypes.string,
  setCourseType: PropTypes.func.isRequired,
  course: PropTypes.shape({}).isRequired,
  setCourse: PropTypes.func.isRequired,
  granularity: PropTypes.string.isRequired,
  setGranularity: PropTypes.func.isRequired,
  calculation: PropTypes.string.isRequired,
  setCalculation: PropTypes.func.isRequired,
  groupUUID: PropTypes.string,
  setGroupUUID: PropTypes.func.isRequired,
  currentDate: PropTypes.string.isRequired,
  groups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isGroupsLoading: PropTypes.bool.isRequired,
  activeTab: PropTypes.string.isRequired,
  isEnterpriseCoursesFetching: PropTypes.bool,
  enterpriseCourses: PropTypes.arrayOf(PropTypes.shape({ })),
  budgets: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isBudgetsFetching: PropTypes.bool.isRequired,
  budgetUUID: PropTypes.string,
  setBudgetUUID: PropTypes.func.isRequired,
};

export default AnalyticsFilters;
