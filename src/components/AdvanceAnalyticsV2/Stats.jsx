import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Spinner,
} from '@openedx/paragon';
import classNames from 'classnames';

const Stats = ({
  isFetching, isError, data,
}) => {
  const formatNumber = (number) => (number >= 10000
    ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(number)
    : String(number));

  if (isError) {
    return (
      <FormattedMessage
        id="advance.analytics.stats.aggregates.notFound.errorMesssage"
        defaultMessage="No Matching Data Found"
        description="Error message when no data is found."
      />
    );
  }
  return (
    <div className={classNames('container-fluid analytics-stats stats-container', { 'is-fetching': isFetching })}>
      {isFetching && (
      <div className="spinner-centered">
        <Spinner animation="border" />
      </div>
      )}
      <div className="row">
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-enrollments">
            <FormattedMessage
              id="advance.analytics.stats.enrollments.title"
              defaultMessage="Enrollments"
              description="Title for the enrollments stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-enrollments">{formatNumber(data?.enrolls || 0)}</p>
        </div>
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-distinct-courses">
            <FormattedMessage
              id="advance.analytics.stats.distinct.courses.title"
              defaultMessage="Distinct Courses"
              description="Title for the distinct courses stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-distinct-courses">{formatNumber(data?.courses || 0)}</p>
        </div>
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-daily-sessions">
            <FormattedMessage
              id="advance.analytics.stats.daily.sessions.title"
              defaultMessage="Daily Sessions"
              description="Title for the daily sessions stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-daily-sessions">{formatNumber(data?.sessions || 0)}</p>
        </div>
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-learning-hours">
            <FormattedMessage
              id="advance.analytics.stats.learning.hours.title"
              defaultMessage="Learning Hours"
              description="Title for the learning hours stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-learning-hours">{formatNumber(data?.hours || 0)}</p>
        </div>
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="mb-0 small title-completions">
            <FormattedMessage
              id="advance.analytics.stats.completions.title"
              defaultMessage="Completions"
              description="Title for the completions stat."
            />
          </p>
          <p className="font-weight-bolder analytics-stat-number value-completions">{formatNumber(data?.completions || 0)}</p>
        </div>
      </div>
    </div>
  );
};

Stats.propTypes = {
  data: PropTypes.shape({
    enrolls: PropTypes.number,
    courses: PropTypes.number,
    sessions: PropTypes.number,
    hours: PropTypes.number,
    completions: PropTypes.number,
  }).isRequired,
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,

};

export default Stats;
