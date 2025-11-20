/* eslint-disable camelcase */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

import { Form } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import EVENT_NAMES from '../../eventTracking';
import { withLocation, withNavigate } from '../../hoc';
import { formatTimestamp, updateUrl } from '../../utils';
import IconWithTooltip from '../IconWithTooltip';
import { TRACK_LEARNER_PROGRESS_TARGETS } from '../ProductTours/AdminOnboardingTours/constants';
import SearchBar from '../SearchBar';

const AdminSearchForm = ({
  searchEnrollmentsList,
  searchParams: {
    searchQuery, searchCourseQuery, searchDateQuery, searchBudgetQuery, searchGroupQuery, searchEnrollmentQuery,
  },
  tableData = [],
  budgets,
  groups,
  navigate,
  location,
  enterpriseId,
}) => {
  const intl = useIntl();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    searchEnrollmentsList();
  }, [searchEnrollmentsList, searchQuery, searchCourseQuery, searchDateQuery, searchBudgetQuery, searchGroupQuery,
    searchEnrollmentQuery]);

  const onCourseSelect = (event) => {
    const updateParams = {
      search_course: event.target.value,
      page: 1,
    };
    if (event.target.value === '') {
      updateParams.search_start_date = '';
    }
    updateUrl(navigate, location.pathname, updateParams);
  };

  const onBudgetSelect = (event) => {
    const updateParams = {
      budget_uuid: event.target.value,
      page: 1,
    };
    updateUrl(navigate, location.pathname, updateParams);
  };

  const onGroupSelect = (event) => {
    const updateParams = {
      group_uuid: event.target.value,
      page: 1,
    };
    updateUrl(navigate, location.pathname, updateParams);
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_PROGRESS_REPORT.FILTER_BY_GROUP_DROPDOWN,
      { group: event.target.value },
    );
  };

  const onEnrollmentSelect = (event) => {
    const updateParams = {
      search_enrollment: event.target.value,
      page: 1,
    };
    updateUrl(navigate, location.pathname, updateParams);
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_PROGRESS_REPORT.FILTER_BY_ENROLLMENT_DROPDOWN,
      { enrollment: event.target.value },
    );
  };

  const courseTitles = Array.from(new Set(tableData.map(en => en.course_title).sort()));
  const courseDates = Array.from(new Set(tableData.map(en => en.course_start_date).sort().reverse()));
  const columnWidth = (budgets?.length || groups?.length) ? 'col-md-3' : 'col-md-6';

  return (
    <div className="row" id={TRACK_LEARNER_PROGRESS_TARGETS.FILTER}>
      <div className="col-12 pr-md-0 mb-0">
        <div className="row w-100 m-0">
          <div className={classNames('col-12 my-2 my-md-0 px-0 px-md-2 px-lg-3', columnWidth)}>
            <Form.Label id="search-email-label" className="mb-2">
              <FormattedMessage
                id="admin.portal.lpr.filter.by.email.input.label"
                defaultMessage="Filter by email"
                description="Label for the email filter dropdown in the admin portal LPR page"
              />
            </Form.Label>
            <SearchBar
              data-testid="admin-search-bar"
              placeholder={intl.formatMessage({
                id: 'admin.portal.lpr.filter.by.email.input.placeholder',
                defaultMessage: 'Search by email...',
                description: 'Placeholder text for the email filter input in the admin portal LPR page.',
              })}
              onSearch={query => updateUrl(navigate, location.pathname, {
                search: query,
                page: 1,
              })}
              onClear={() => updateUrl(navigate, location.pathname, { search: undefined })}
              value={searchQuery}
              aria-labelledby="search-email-label"
              className="py-0"
              inputProps={{ 'data-hj-suppress': true }}
            />
          </div>
          {groups?.length ? (
            <div className="col-12 col-md-3 my-2 my-md-0 px-0 px-md-2 px-lg-3">
              <Form.Group>
                <Form.Label className="search-label mb-2">
                  <FormattedMessage
                    id="admin.portal.lpr.filter.by.group.dropdown.label"
                    defaultMessage="Filter by group"
                    description="Label for the group filter dropdown in the admin portal LPR page."
                  />
                </Form.Label>
                <Form.Control
                  data-testid="admin-search-form-control"
                  className="w-100 groups-dropdown"
                  as="select"
                  value={searchGroupQuery}
                  onChange={e => onGroupSelect(e)}
                >
                  <option value="">
                    {intl.formatMessage({
                      id: 'admin.portal.lpr.v2.filter.by.group.dropdown.option.all.groups',
                      defaultMessage: 'All groups',
                      description: 'Label for the all groups option in the group filter dropdown in the admin portal LPR page.',
                    })}
                  </option>
                  {groups.map(group => (
                    <option
                      value={group.uuid}
                      key={group.uuid}
                    >
                      {group.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
          ) : null}
          {budgets?.length ? (
            <div className="col-12 col-md-3 my-2 my-md-0 px-0 px-md-2 px-lg-3">
              <Form.Group>
                <Form.Label className="search-label mb-2">
                  <FormattedMessage
                    id="admin.portal.lpr.filter.by.budget.dropdown.label"
                    defaultMessage="Filter by budget"
                    description="Label for the budget filter dropdown in the admin portal LPR page."
                  />
                </Form.Label>
                <Form.Control
                  data-testid="admin-search-form-control"
                  className="w-100 budgets-dropdown"
                  as="select"
                  value={searchBudgetQuery}
                  onChange={e => onBudgetSelect(e)}
                >
                  <option value="">
                    {intl.formatMessage({
                      id: 'admin.portal.lpr.filter.by.budget.dropdown.option.all.budgets',
                      defaultMessage: 'All budgets',
                      description: 'Label for the all budgets option in the budget filter dropdown in the admin portal LPR page.',
                    })}
                  </option>
                  {budgets.map(budget => (
                    <option
                      value={budget.subsidy_access_policy_uuid}
                      key={budget.subsidy_access_policy_uuid}
                    >
                      {budget.subsidy_access_policy_display_name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
          ) : null }
          {/* Filter by Enrollment */}
          <div className="col-12 col-md-3 my-2 my-md-0 px-0 px-md-2 px-lg-3">
            <Form.Group>
              <Form.Label className="search-label mb-2">
                <FormattedMessage
                  id="admin.portal.lpr.filter.by.enrollment.dropdown.label"
                  defaultMessage="Filter by enrollment"
                />
              </Form.Label>
              <Form.Control
                data-testid="admin-search-form-control"
                className="w-100 enrollments-dropdown"
                as="select"
                value={searchEnrollmentQuery}
                onChange={e => onEnrollmentSelect(e)}
              >
                <option value="">
                  {intl.formatMessage({
                    id: 'admin.portal.lpr.filter.by.enrollment.dropdown.option.all',
                    defaultMessage: 'All',
                  })}
                </option>
                <option value="enrolled">
                  {intl.formatMessage({
                    id: 'admin.portal.lpr.filter.by.enrollment.dropdown.option.enrolled',
                    defaultMessage: 'Enrolled',
                  })}
                </option>
                <option value="unenrolled">
                  {intl.formatMessage({
                    id: 'admin.portal.lpr.filter.by.enrollment.dropdown.option.unenrolled',
                    defaultMessage: 'Unenrolled',
                  })}
                </option>
              </Form.Control>
            </Form.Group>
          </div>
          <div className="col-12 col-md-3 px-0 pl-0 pr-md-2 pr-lg-3">
            <Form.Group>
              <Form.Label className="search-label mb-2">
                <FormattedMessage
                  id="admin.portal.lpr.filter.by.course.dropdown.label"
                  defaultMessage="Filter by course"
                  description="Label for the course filter dropdown in the admin portal LPR page."
                />
              </Form.Label>
              <Form.Control
                data-testid="admin-search-form-control"
                className="w-100 course-dropdown"
                as="select"
                value={searchCourseQuery}
                onChange={e => onCourseSelect(e)}
              >
                <option value="">
                  {intl.formatMessage({
                    id: 'admin.portal.lpr.v2.filter.by.course.dropdown.option.all.courses',
                    defaultMessage: 'All courses',
                    description: 'Label for the all courses option in the course filter dropdown in the admin portal LPR page.',
                  })}
                </option>
                {courseTitles.map(title => (
                  <option
                    value={title}
                    key={title}
                  >
                    {title}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </div>
          <div className="col-12 col-md-3 px-0 pr-0 px-md-2 px-lg-3">
            <Form.Group>
              <Form.Label className="search-label mb-2 d-flex align-items-center">
                <span>
                  <FormattedMessage
                    id="admin.portal.lpr.filter.by.start.date.dropdown.label"
                    defaultMessage="Filter by start date"
                    description="Label for the start date filter dropdown in the admin portal LPR page."
                  />
                </span>
                <IconWithTooltip
                  icon={Info}
                  altText={intl.formatMessage({
                    id: 'admin.portal.lpr.filter.by.start.date.alt.text',
                    defaultMessage: 'More information',
                    description: 'Alt text for the info icon in the start date filter dropdown in the admin portal LPR page.',
                  })}
                  tooltipText={intl.formatMessage({
                    id: 'admin.portal.lpr.filter.by.start.date.dropdown.tooltip',
                    defaultMessage: 'A start date can be selected after the course name is selected.',
                    description: 'Tooltip text for the start date filter dropdown in the admin portal LPR page.',
                  })}
                />
              </Form.Label>
              <Form.Control
                data-testid="admin-search-form-control"
                as="select"
                className="w-100 start-date-dropdown"
                value={searchDateQuery}
                onChange={event => updateUrl(navigate, location.pathname, {
                  search_start_date: event.target.value,
                  page: 1,
                })}
                disabled={!searchCourseQuery}
              >
                <option value="">
                  {searchCourseQuery ? intl.formatMessage({
                    id: 'admin.portal.lpr.filter.by.start.date.dropdown.option.all.dates',
                    defaultMessage: 'All Dates',
                    description: 'Label for the all dates option in the start date filter dropdown in the admin portal LPR page.',
                  }) : intl.formatMessage({
                    id: 'admin.portal.lpr.filter.by.start.date.dropdown.option.choose.course',
                    defaultMessage: 'Choose a course',
                    description: 'Label for the Choose a course option in the start date filter dropdown in the admin portal LPR page.',
                  })}
                </option>
                {searchCourseQuery && courseDates.map(date => (
                  <option
                    value={date}
                    key={date}
                  >
                    {intl.formatDate(formatTimestamp({ timestamp: date }), {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </div>

        </div>
      </div>
    </div>
  );
};

AdminSearchForm.defaultProps = {
  tableData: [],
};

AdminSearchForm.propTypes = {
  searchEnrollmentsList: PropTypes.func.isRequired,
  searchParams: PropTypes.shape({
    searchQuery: PropTypes.string,
    searchCourseQuery: PropTypes.string,
    searchDateQuery: PropTypes.string,
    searchBudgetQuery: PropTypes.string,
    searchGroupQuery: PropTypes.string,
    searchEnrollmentQuery: PropTypes.string,
  }).isRequired,
  tableData: PropTypes.arrayOf(PropTypes.shape({})),
  budgets: PropTypes.arrayOf(PropTypes.shape({})),
  groups: PropTypes.arrayOf(PropTypes.shape({})),
  navigate: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
  enterpriseId: PropTypes.string,
};

export default withLocation(withNavigate(AdminSearchForm));
