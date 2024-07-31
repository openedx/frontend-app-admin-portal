import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const Stats = ({
  enrollments, distinctCourses, dailySessions, learningHours, completions,
}) => {
  const formatter = Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 });

  return (
    <div className="container-fluid analytics-stats">
      <div className="row">
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-enrollments">
            <FormattedMessage
              id="advance.analytics.stats.enrollments.title"
              defaultMessage="Enrollments"
              description="Title for the enrollments stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-enrollments">{formatter.format(enrollments)}</p>
        </div>
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-distinct-courses">
            <FormattedMessage
              id="advance.analytics.stats.distinct.courses.title"
              defaultMessage="Distinct Courses"
              description="Title for the distinct courses stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-distinct-courses">{formatter.format(distinctCourses)}</p>
        </div>
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-daily-sessions">
            <FormattedMessage
              id="advance.analytics.stats.daily.sessions.title"
              defaultMessage="Daily Sessions"
              description="Title for the daily sessions stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-daily-sessions">{formatter.format(dailySessions)}</p>
        </div>
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-learning-hours">
            <FormattedMessage
              id="advance.analytics.stats.learning.hours.title"
              defaultMessage="Learning Hours"
              description="Title for the learning hours stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-learning-hours">{formatter.format(learningHours)}</p>
        </div>
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-completions">
            <FormattedMessage
              id="advance.analytics.stats.completions.title"
              defaultMessage="Completions"
              description="Title for the completions stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-completions">{formatter.format(completions)}</p>
        </div>
      </div>
    </div>
  );
};

Stats.propTypes = {
  enrollments: PropTypes.number.isRequired,
  distinctCourses: PropTypes.number.isRequired,
  dailySessions: PropTypes.number.isRequired,
  learningHours: PropTypes.number.isRequired,
  completions: PropTypes.number.isRequired,
};

export default Stats;
