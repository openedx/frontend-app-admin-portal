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
        {enrollments?.completed?.map((enrollment) => (
          <EnrollmentCard enrollment={enrollment} />
        ))}
        {enrollments?.inProgress?.map((enrollment) => (
          <EnrollmentCard enrollment={enrollment} />
        ))}
        {enrollments?.upcoming?.map((enrollment) => (
          <EnrollmentCard enrollment={enrollment} />
        ))}
      </>
    )}
  </div>
);

CourseEnrollments.propTypes = {
  enrollments: PropTypes.shape({
    completed: PropTypes.arrayOf({
      courseKey: PropTypes.string,
      courseType: PropTypes.string,
      courseRunStatus: PropTypes.string,
      displayName: PropTypes.string,
      orgName: PropTypes.string,
    }).isRequired,
    inProgress: PropTypes.arrayOf({
      courseKey: PropTypes.string,
      courseType: PropTypes.string,
      courseRunStatus: PropTypes.string,
      displayName: PropTypes.string,
      orgName: PropTypes.string,
    }).isRequired,
    upcoming: PropTypes.arrayOf({
      courseKey: PropTypes.string,
      courseType: PropTypes.string,
      courseRunStatus: PropTypes.string,
      displayName: PropTypes.string,
      orgName: PropTypes.string,
    }).isRequired,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default CourseEnrollments;
