import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Spinner } from '@openedx/paragon';
import classNames from 'classnames';

const Stats = ({
  isFetching, isError, data, title, activeTab,
}) => {
  const formatNumber = (number) => (number >= 10000
    ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(number)
    : String(number));

  if (isError) {
    return (
      <FormattedMessage
        id="advance.analytics.engagement.stats.aggregates.notFound.error.messsage"
        defaultMessage="No Matching Data Found"
        description="Error message when no data is found."
      />
    );
  }

  const isEngagementTab = activeTab === 'engagements';
  const isOutcomesTab = activeTab === 'outcomes';

  return (
    <div className="container-fluid bg-primary-100 rounded-lg p-3 mb-1">
      <h2 className="font-weight-bold mb-3">
        <FormattedMessage
          id="advance.analytics.engagement.stats.engagement.metrics.heading"
          defaultMessage="{title} metrics"
          values={{ title }}
          description="Heading for the analytics stats section"
        />
      </h2>

      <div className={classNames('stats-container bg-white border-white rounded-lg pt-3 analytics-stats-inner-container', { 'is-fetching': isFetching })}>
        {isFetching && (
          <div className="spinner-centered">
            <Spinner animation="border" />
          </div>
        )}
        <div className="row">
          {isEngagementTab && (
            <>
              <div className="col d-flex flex-column justify-content-center align-items-center">
                <p className="mb-0 small font-weight-normal title-enrollments">
                  <FormattedMessage id="advance.analytics.enrollments.stats.title" defaultMessage="Enrollments" />
                </p>
                <p className="font-weight-bolder analytics-stat-number value-enrollments">{formatNumber(data?.enrolls || 0)}</p>
              </div>

              <div className="col d-flex flex-column justify-content-center align-items-center">
                <p className="mb-0 small font-weight-normal title-distinct-courses">
                  <FormattedMessage id="advance.analytics.engagement.stats.distinct.courses.title" defaultMessage="Distinct Courses" />
                </p>
                <p className="font-weight-bolder analytics-stat-number value-distinct-courses">{formatNumber(data?.courses || 0)}</p>
              </div>

              <div className="col d-flex flex-column justify-content-center align-items-center">
                <p className="mb-0 small font-weight-normal title-daily-sessions">
                  <FormattedMessage id="advance.analytics.engagement.stats.daily.sessions.title" defaultMessage="Daily Sessions" />
                </p>
                <p className="font-weight-bolder analytics-stat-number value-daily-sessions">{formatNumber(data?.sessions || 0)}</p>
              </div>

              <div className="col d-flex flex-column justify-content-center align-items-center">
                <p className="mb-0 small font-weight-normal title-learning-hours">
                  <FormattedMessage id="advance.analytics.engagement.stats.learning.hours.title" defaultMessage="Learning Hours" />
                </p>
                <p className="font-weight-bolder analytics-stat-number value-learning-hours">{formatNumber(data?.hours || 0)}</p>
              </div>

              <div className="col d-flex flex-column justify-content-center align-items-center">
                <p className="mb-0 small font-weight-normal title-completions">
                  <FormattedMessage id="advance.analytics.engagement.stats.completions.title" defaultMessage="Completions" />
                </p>
                <p className="font-weight-bolder analytics-stat-number value-completions">{formatNumber(data?.completions || 0)}</p>
              </div>
            </>
          )}

          {isOutcomesTab && (
            <>
              <div className="col d-flex flex-column justify-content-center align-items-center">
                <p className="mb-0 small font-weight-normal title-completions">
                  <FormattedMessage id="advance.analytics.outcomes.stats.completions.title" defaultMessage="Completions" />
                </p>
                <p className="font-weight-bolder analytics-stat-number value-completions">{formatNumber(data?.completions || 0)}</p>
              </div>

              <div className="col d-flex flex-column justify-content-center align-items-center">
                <p className="mb-0 small font-weight-normal title-unique-skills">
                  <FormattedMessage id="advance.analytics.outcomes.stats.unique.skills.title" defaultMessage="Unique skills gained" />
                </p>
                <p className="font-weight-bolder analytics-stat-number value-unique-skills">{formatNumber(data?.uniqueSkillsGained || 0)}</p>
              </div>

              <div className="col d-flex flex-column justify-content-center align-items-center">
                <p className="mb-0 small font-weight-normal title-upskilled-learners">
                  <FormattedMessage id="advance.analytics.outcomes.stats.upskilled.learners.title" defaultMessage="Upskilled learners" />
                </p>
                <p className="font-weight-bolder analytics-stat-number value-upskilled-learners">{formatNumber(data?.upskilledLearners || 0)}</p>
              </div>

              <div className="col d-flex flex-column justify-content-center align-items-center">
                <p className="mb-0 small font-weight-normal title-new-skills">
                  <FormattedMessage
                    id="advance.analytics.outcomes.stats.new.skills.gained.title"
                    defaultMessage="New skills gained"
                  />
                </p>
                <p className="font-weight-bolder analytics-stat-number value-new-skills">{formatNumber(data?.newSkillsLearned || 0)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

Stats.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.shape({
    enrolls: PropTypes.number,
    courses: PropTypes.number,
    sessions: PropTypes.number,
    hours: PropTypes.number,
    completions: PropTypes.number,
    uniqueSkillsGained: PropTypes.number,
    upskilledLearners: PropTypes.number,
    newSkillsLearned: PropTypes.number,
  }).isRequired,
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  activeTab: PropTypes.string.isRequired,
};

export default Stats;
