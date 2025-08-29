import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Skeleton, Card } from '@openedx/paragon';
import EnrollmentCard from './EnrollmentCard';

const CourseEnrollments = ({ enrollments, isLoading }) => {
  const intl = useIntl();
  const noEnrollmentsMessage = intl.formatMessage({
    id: 'adminPortal.peopleManagement.learnerDetailPage.noEnrollmentsMessage',
    defaultMessage: 'This learner has not enrolled in any courses.',
    description: 'Message displayed when a learner has no course enrollments',
  });

  const enrollmentTypes = ['assignmentsForDisplay', 'inProgress', 'upcoming', 'savedForLater', 'completed'];
  const flattenedEnrollments = enrollmentTypes.flatMap(type => enrollments?.[type] || []);
  const hasEnrollments = flattenedEnrollments.length > 0;

  if (isLoading) {
    return (
      <div className="ml-5">
        <Skeleton width={400} height={200} data-testid="skeleton" />
      </div>
    );
  }

  return (
    <>
      <h3>Enrollments</h3>
      {hasEnrollments ? (
        <>
          {flattenedEnrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.uuid} enrollment={enrollment} />
          ))}
        </>
      ) : (
        <Card className="mb-4">
          <Card.Section>
            <p className="text-muted mb-0 pt-3 pb-3 pl-3 ">{noEnrollmentsMessage}</p>
          </Card.Section>
        </Card>
      )}
    </>
  );
};

const enrollmentShape = PropTypes.shape({
  courseKey: PropTypes.string,
  courseType: PropTypes.string,
  courseRunStatus: PropTypes.string,
  displayName: PropTypes.string,
  orgName: PropTypes.string,
  policyUuid: PropTypes.string,
  startDate: PropTypes.string,
  enrollBy: PropTypes.string,
}).isRequired;

CourseEnrollments.propTypes = {
  enrollments: PropTypes.shape({
    completed: PropTypes.arrayOf(enrollmentShape),
    inProgress: PropTypes.arrayOf(enrollmentShape),
    upcoming: PropTypes.arrayOf(enrollmentShape),
    savedForLater: PropTypes.arrayOf(enrollmentShape),
    assignmentsForDisplay: PropTypes.arrayOf(enrollmentShape),
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default CourseEnrollments;
