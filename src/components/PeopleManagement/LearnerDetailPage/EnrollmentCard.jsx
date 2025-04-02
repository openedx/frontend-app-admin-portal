import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Badge, Card, Hyperlink, Stack,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { COURSE_TYPE_MAP } from '../constants';

const EnrollmentCard = ({ enrollment, enterpriseSlug }) => {
  const renderBadge = () => {
    switch (enrollment.courseRunStatus) {
      case 'completed': {
        return (<Badge variant="light">Completed</Badge>);
      }
      case 'in_progress': {
        return (<Badge variant="success">In Progress</Badge>);
      }
      default: {
        return (<Badge variant="info">Upcoming</Badge>);
      }
    }
  };

  return (
    <Card className="mt-4 p-4">
      <Stack direction="horizontal" className="justify-content-between">
        <h3 className="mb-1">{enrollment.displayName}</h3>
        {renderBadge()}
      </Stack>
      <p className="small">{enrollment.orgName} • {COURSE_TYPE_MAP[enrollment.courseType]}</p>
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
  }).isRequired,
};

export default connect(mapStateToProps)(EnrollmentCard);
