import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Badge, Card, Hyperlink, Stack,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { COURSE_TYPE_MAP } from '../constants';
import { formatDate } from '../../learner-credit-management/data';

const EnrollmentCard = ({ enrollment, enterpriseSlug }) => {
  const renderBadge = () => {
    switch (enrollment.courseRunStatus) {
      case 'completed': {
        return (<Badge variant="light">Completed</Badge>);
      }
      case 'in_progress': {
        return (<Badge variant="success">In Progress</Badge>);
      }
      case 'upcoming': {
        return (<Badge variant="info">Upcoming</Badge>);
      }
      default: {
        return (<Badge variant="info">Assigned</Badge>);
      }
    }
  };

  const isAssignedCourse = enrollment.courseRunStatus === 'assigned';

  return (
    <Card className="mt-4 p-4">
      <Stack direction="horizontal" className="justify-content-between">
        <h3 className="mb-1">{enrollment.displayName}</h3>
        {renderBadge()}
      </Stack>
      <p className="small">{enrollment.orgName} • {COURSE_TYPE_MAP[enrollment.courseType]}</p>
      {isAssignedCourse && (
        <p className="small">Starts {formatDate(enrollment.startDate)} • Learner must enroll by {formatDate(enrollment.enrollBy)}</p>
      )}
      <Card.Footer className="p-0 justify-content-start">
        <Hyperlink
          className="btn btn-outline-primary"
          target="_blank"
          destination={`${getConfig().ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${enrollment.courseKey}`}
        >
          <FormattedMessage
            id="adminPortal.peopleManagement.learnerDetailPage.enrollmentCard.learnerPortalLink"
            defaultMessage="View course"
            description="Button text for hyperlink to view course on learner portal."
          />
        </Hyperlink>
        {isAssignedCourse && (
          <Hyperlink
            className="btn btn-outline-primary"
            target="_blank"
            destination={`/${enterpriseSlug}/admin/learner-credit/${enrollment.policyUuid}/activity`}
          >
            <FormattedMessage
              id="adminPortal.peopleManagement.learnerDetailPage.enrollmentCard.learnerCreditAssignmentTable"
              defaultMessage="View assignment"
              description="Button text for hyperlink to view assignment table."
            />
          </Hyperlink>
        )}
      </Card.Footer>
    </Card>
  );
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

EnrollmentCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enrollment: PropTypes.shape({
    courseKey: PropTypes.string,
    courseType: PropTypes.string,
    courseRunStatus: PropTypes.string,
    displayName: PropTypes.string,
    orgName: PropTypes.string,
    policyUuid: PropTypes.string,
    startDate: PropTypes.string,
    enrollBy: PropTypes.string,
  }).isRequired,
};

export default connect(mapStateToProps)(EnrollmentCard);
