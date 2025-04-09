import PropTypes from 'prop-types';
import { Skeleton } from '@openedx/paragon';
import EnrollmentCard from './EnrollmentCard';

const CourseEnrollments = ({ enrollments, isLoading }) => (
  <div className="ml-5">
    {isLoading && !enrollments ? (
      <Skeleton
        width={400}
        height={200}
      />
    ) : (
      <>
        <h3>Enrollments</h3>
        {enrollments?.inProgress?.map((enrollment) => (
          <EnrollmentCard enrollment={enrollment} />
        ))}
        {enrollments?.upcoming?.map((enrollment) => (
          <EnrollmentCard enrollment={enrollment} />
        ))}
        {enrollments?.completed?.map((enrollment) => (
          <EnrollmentCard enrollment={enrollment} />
        ))}
        {enrollments.assignmentsForDisplay.map((enrollment) => (
          <EnrollmentCard enrollment={enrollment} />
        ))}
      </>
    )}
  </div>
);

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
