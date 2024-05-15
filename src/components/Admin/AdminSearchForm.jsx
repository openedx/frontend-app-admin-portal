/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';

import { Form } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import SearchBar from '../SearchBar';
import { formatTimestamp, updateUrl } from '../../utils';
import IconWithTooltip from '../IconWithTooltip';
import { withLocation, withNavigate } from '../../hoc';

class AdminSearchForm extends React.Component {
  componentDidUpdate(prevProps) {
    const { searchParams: { searchQuery, searchCourseQuery, searchDateQuery } } = this.props;
    const {
      searchParams: {
        searchQuery: prevSearchQuery,
        searchCourseQuery: prevSearchCourseQuery,
        searchDateQuery: prevSearchDateQuery,
      },
    } = prevProps;

    if (searchQuery !== prevSearchQuery || searchCourseQuery !== prevSearchCourseQuery
        || searchDateQuery !== prevSearchDateQuery) {
      this.handleSearch();
    }
  }

  handleSearch() {
    this.props.searchEnrollmentsList();
  }

  onCourseSelect(event) {
    const { navigate, location } = this.props;
    const updateParams = {
      search_course: event.target.value,
      page: 1,
    };
    if (event.target.value === '') {
      updateParams.search_start_date = '';
    }
    updateUrl(navigate, location.pathname, updateParams);
  }

  render() {
    const {
      intl,
      tableData,
      searchParams: { searchCourseQuery, searchDateQuery, searchQuery },
    } = this.props;
    const courseTitles = Array.from(new Set(tableData.map(en => en.course_title).sort()));
    const courseDates = Array.from(new Set(tableData.map(en => en.course_start_date).sort().reverse()));

    return (
      <div className="row">
        <div className="col-12 pr-md-0 mb-0">
          <div className="row w-100 m-0">
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
                  className="w-100"
                  as="select"
                  value={searchCourseQuery}
                  onChange={e => this.onCourseSelect(e)}
                >
                  <option value="">
                    {intl.formatMessage({
                      id: 'admin.portal.lpr.filter.by.course.dropdown.option.all.courses',
                      defaultMessage: 'All Courses',
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
                  as="select"
                  className="w-100"
                  value={searchDateQuery}
                  onChange={event => updateUrl(this.props.navigate, this.props.location.pathname, {
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
            <div className="col-12 col-md-6 my-2 my-md-0 px-0 px-md-2 px-lg-3">
              <Form.Label id="search-email-label" className="mb-2">
                <FormattedMessage
                  id="admin.portal.lpr.filter.by.email.input.label"
                  defaultMessage="Filter by email"
                  description="Label for the email filter dropdown in the admin portal LPR page"
                />
              </Form.Label>
              <SearchBar
                placeholder={intl.formatMessage({
                  id: 'admin.portal.lpr.filter.by.email.input.placeholder',
                  defaultMessage: 'Search by email...',
                  description: 'Placeholder text for the email filter input in the admin portal LPR page.',
                })}
                onSearch={query => updateUrl(this.props.navigate, this.props.location.pathname, {
                  search: query,
                  page: 1,
                })}
                onClear={() => updateUrl(this.props.navigate, this.props.location.pathname, { search: undefined })}
                value={searchQuery}
                aria-labelledby="search-email-label"
                className="py-0"
                inputProps={{ 'data-hj-suppress': true }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AdminSearchForm.defaultProps = {
  tableData: [],
};

AdminSearchForm.propTypes = {
  searchEnrollmentsList: PropTypes.func.isRequired,
  searchParams: PropTypes.shape({
    searchQuery: PropTypes.string,
    searchCourseQuery: PropTypes.string,
    searchDateQuery: PropTypes.string,
  }).isRequired,
  tableData: PropTypes.arrayOf(PropTypes.shape({})),
  navigate: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
  // injected
  intl: intlShape.isRequired,
};

export default withLocation(withNavigate(injectIntl(AdminSearchForm)));
