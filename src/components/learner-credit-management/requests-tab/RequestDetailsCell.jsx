import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const RequestDetailsCell = ({ row, enterpriseSlug }) => {
  const { email, courseTitle, courseId } = row.original;
  const { config: { ENTERPRISE_LEARNER_PORTAL_URL } } = useContext(AppContext);
  const linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${courseId}`;
  return (
    <div>
      <div className="font-weight-bold text-primary">
        {email}
      </div>
      <div className="small">
        <Link
          className="decoration-none"
          data-testid="course-link"
          to={linkToCourse}
          target="_blank"
        >
          {courseTitle}
        </Link>
      </div>
    </div>
  );
};

RequestDetailsCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      email: PropTypes.string.isRequired,
      courseTitle: PropTypes.string.isRequired,
      courseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export default RequestDetailsCell;
