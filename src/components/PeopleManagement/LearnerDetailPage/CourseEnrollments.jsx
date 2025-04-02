import PropTypes from 'prop-types';
import { Skeleton } from '@openedx/paragon';
import EnrollmentCard from './EnrollmentCard';
import useEnterpriseCourseEnrollments from '../data/hooks/useEnterpriseCourseEnrollments';

const CourseEnrollments = ({ userEmail, lmsUserId, enterpriseUuid }) => {
  const { isLoading, data } = useEnterpriseCourseEnrollments({ userEmail, lmsUserId, enterpriseUuid });
  const enrollments = data?.data.enrollments;

  return (
    <div className="ml-5">
      {isLoading && !enrollments ? (
        <Skeleton
          width={400}
          height={200}
        />
      ) : (
        <>
          <h3>Enrollments</h3>
          {enrollments.completed.map((enrollment) => (
            <EnrollmentCard enrollment={enrollment} />
          ))}
          {enrollments.inProgress.map((enrollment) => (
            <EnrollmentCard enrollment={enrollment} />
          ))}
          {enrollments.upcoming.map((enrollment) => (
            <EnrollmentCard enrollment={enrollment} />
          ))}
        </>
      )}
    </div>
  );
};
CourseEnrollments.propTypes = {
  userEmail: PropTypes.string.isRequired,
  lmsUserId: PropTypes.string.isRequired,
  enterpriseUuid: PropTypes.string.isRequired,
};

export default CourseEnrollments;
