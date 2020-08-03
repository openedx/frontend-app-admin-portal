/* eslint-disable camelcase */
import qs from 'query-string';
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { Form } from '@edx/paragon';


import SearchBar from '../SearchBar';
import { updateUrl } from '../../utils';
import IconWithTooltip from '../IconWithTooltip';

class AdminSearchForm extends React.Component {
  constructor(props) {
    super(props);
    const { location } = props;
    const queryParams = qs.parse(location.search);
    this.state = {
      searchQuery: queryParams.search,
      searchCourseQuery: queryParams.search_course,
      searchDateQuery: queryParams.search_start_date,
    };
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    if (location.search !== prevProps.location.search) {
      // eslint-disable-next-line camelcase
      const { search, search_course, search_start_date } = qs.parse(location.search);
      const {
        search: prevSearch,
        search_course: prevSearchCourse,
        search_start_date: prevSearchDate,
      } = qs.parse(prevProps.location.search);
      if (search !== prevSearch || search_course !== prevSearchCourse ||
        search_start_date !== prevSearchDate) {
        this.handleSearch(search, search_course, search_start_date);
      }
    }
  }

  onCourseSelect(event) {
    const updateParams = {
      search_course: event.target.value,
      page: 1,
    };
    if (event.target.value === '') {
      updateParams.search_start_date = '';
    }
    updateUrl(updateParams);
  }

  handleSearch(emailSearch, courseSearch, dateSearch) {
    this.setState({
      searchQuery: emailSearch,
      searchCourseQuery: courseSearch,
      searchDateQuery: dateSearch,
    });
    this.props.searchEnrollmentsList();
  }

  render() {
    const { searchCourseQuery, searchDateQuery, searchQuery } = this.state;
    const { tableData } = this.props;
    const courseTitles = new Set(tableData.map(en => en.course_title));
    const courseDates = new Set(tableData.map(en => en.course_start).sort().reverse());

    return (
      <div className="row">
        <div className="col-12 pr-md-0 mb-0">
          <div className="row w-100 m-0">
            <div className="col-12 col-md-6 px-0">
              <Form inline role="search">
                <div className="col-6 pl-0 pr-md-2 pr-lg-3">
                  <Form.Group>
                    <Form.Label id="course-title-search" className="search-label mb-2">Filter by course</Form.Label>
                    <Form.Control
                      className="w-100"
                      as="select"
                      aria-labelledby="course-title-search"
                      value={searchCourseQuery}
                      onChange={e => this.onCourseSelect(e)}
                    >
                      <option value="">All Courses</option>
                      {courseTitles.map(title => (
                        <option
                          value={title}
                          key={title}
                        >
                          {title}
                        </option>))}
                    </Form.Control>
                  </Form.Group>
                </div>
                <div className="col-6 pr-0 px-md-2 px-lg-3">
                  <Form.Group>
                    <Form.Label id="date-search" className="search-label mb-2">
                      Filter by start date
                      <IconWithTooltip
                        icon={faInfoCircle}
                        altText="More information"
                        tooltipText="A start date can be selected after the course name is selected."
                      />
                    </Form.Label>
                    <Form.Control
                      as="select"
                      className="w-100"
                      aria-labelledby="date-search"
                      value={searchDateQuery}
                      onChange={event => updateUrl({
                        search_start_date: event.target.value,
                        page: 1,
                        })
                    }
                      disabled={!searchCourseQuery}
                    >
                      <option value="">{searchCourseQuery ? 'All Dates' : 'Choose a course'}</option>
                      {searchCourseQuery && courseDates.map(date => (
                        <option
                          value={date}
                          key={date}
                        >
                          {moment(date).format('MMMM D, YYYY')}
                        </option>))}
                    </Form.Control>
                  </Form.Group>
                </div>
              </Form>
            </div>
            <div className="col-12 col-md-6 my-2 my-md-0 px-0 px-md-2 px-lg-3">
              <Form.Label id="search-email-label" className="mb-2">Filter by email</Form.Label>
              <SearchBar
                placeholder="Search by email..."
                onSearch={query => updateUrl({
                  search: query,
                  page: 1,
                })}
                onClear={() => updateUrl({ search: undefined })}
                value={searchQuery}
                aria-labelledby="search-email-label"
                className="py-0"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AdminSearchForm.defaultProps = {
  location: {
    search: null,
  },
  tableData: [],
};

AdminSearchForm.propTypes = {
  searchEnrollmentsList: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      actionSlug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  tableData: PropTypes.arrayOf(PropTypes.shape({})),
};

export default AdminSearchForm;
