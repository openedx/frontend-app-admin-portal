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

  const hasEnrollments = enrollments?.completed?.length > 0
    || enrollments?.inProgress?.length > 0
    || enrollments?.upcoming?.length > 0
    || enrollments?.assignmentsForDisplay?.length > 0;

  return (
    <div className="ml-5">
      {isLoading ? (
        <Skeleton
          width={400}
          height={200}
          data-testid="skeleton"
        />
      ) : (
        <>
          <h3>Enrollments</h3>
          {hasEnrollments ? (
            <>
              {enrollments?.inProgress?.map((enrollment) => (
                <EnrollmentCard key={enrollment.uuid} enrollment={enrollment} />
              ))}
              {enrollments?.upcoming?.map((enrollment) => (
                <EnrollmentCard key={enrollment.uuid} enrollment={enrollment} />
              ))}
              {enrollments?.completed?.map((enrollment) => (
                <EnrollmentCard key={enrollment.uuid} enrollment={enrollment} />
              ))}
              {enrollments?.assignmentsForDisplay?.map((enrollment) => (
                <EnrollmentCard key={enrollment.uuid} enrollment={enrollment} />
              ))}
            </>
          ) : (
            <Card className="mb-4">
              <Card.Body>
                <p className="text-muted mb-0 pt-3 pb-3 pl-3 ">{noEnrollmentsMessage}</p>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </div>
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
    assignmentsForDisplay: PropTypes.arrayOf(enrollmentShape),
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default CourseEnrollments;
