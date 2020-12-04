/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';

const CourseSearchResults = ({
  searchResults,
}) => {
  const hasResults = searchResults && searchResults.nbHits !== 0;
  if (!hasResults) { return <div>No Courses found for this Enterprise</div>; }
  return (
    <div className="row container-fluid">
      {searchResults.nbHits} courses available for enrollment.
      <ul>
        {searchResults.hits.map(course => (
          <li>
            {course.title}, {course.partners[0].name}, course_type_goes_here, {course.course_run ? course.course_run : 'course_run_goes_here'}
          </li>
        ))}
      </ul>
    </div>
  );
};

CourseSearchResults.defaultProps = {
  searchState: { query: '' },
  searchResults: { nbHits: 0 },
};

CourseSearchResults.propTypes = {
  searchState: PropTypes.shape({ query: PropTypes.string }),
  searchResults: PropTypes.shape({ nbHits: PropTypes.number }),
};

export default connectStateResults(CourseSearchResults);
