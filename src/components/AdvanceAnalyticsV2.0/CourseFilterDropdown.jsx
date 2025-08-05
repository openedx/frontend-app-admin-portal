import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import Select from 'react-select';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useEnterpriseCourses from './data/hooks/useEnterpriseCourses';

const CourseFilterDropdown = ({ selectedCourse, onChange }) => {
  const { data: courses = [], isLoading } = useEnterpriseCourses();

  return (
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
        options={courses}
        value={selectedCourse}
        onChange={onChange}
        placeholder="Select a course..."
        isLoading={isLoading}
        isClearable
        className="w-100 course-filter-select"
        classNamePrefix="course-filter-select"
        filterOption={(option, input) => option.label.toLowerCase().includes(input.toLowerCase())}
      />
    </div>
  );
};

CourseFilterDropdown.propTypes = {
  selectedCourse: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CourseFilterDropdown;
