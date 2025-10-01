import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import Select from 'react-select';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const CourseFilterDropdown = ({
  isFetching, enterpriseCourses, selectedCourse, onChange,
}) => (
  <div className="mb-3">
    <label htmlFor="course-select" className="form-label text-sm mb-1 d-block m-1">
      <FormattedMessage
        id="advance.analytics.filter.by.course"
        defaultMessage="Filter by course"
        description="Advance analytics filter by course label"
      />
    </label>
    <Select
      inputId="course-select"
      options={enterpriseCourses}
      value={selectedCourse}
      onChange={onChange}
      placeholder="Select a course..."
      isLoading={isFetching}
      isClearable
      className="w-100 course-filter-select"
      classNamePrefix="course-filter-select"
      filterOption={(option, input) => option.label.toLowerCase().includes(input.toLowerCase())}
      aria-label="Filter by course"
    />
  </div>
);

CourseFilterDropdown.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  enterpriseCourses: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })),
  selectedCourse: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
  onChange: PropTypes.func.isRequired,
};

export default CourseFilterDropdown;
