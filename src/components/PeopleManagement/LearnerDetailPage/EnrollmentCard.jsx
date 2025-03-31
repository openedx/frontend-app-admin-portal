/* eslint quote-props: 0 */
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Badge, Card, Hyperlink, Stack,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { camelCaseDict } from '../../../utils';

const EnrollmentCard = ({ enrollment, enterpriseSlug }) => {
  const COURSE_TYPE_MAP = {
    'audit': 'Audit',
    'professional': 'Professional',
    'verified-audit': 'Verified Audit',
    'credit-verified-audit': 'Credit Verified Audit',
    'masters': 'Masters',
    'masters-verified-audit': 'Masters Verified Audit',
    'verified': 'Verified',
    'spoc-verified-audit': 'SPOC Verified Audit',
    'honor': 'Honor',
    'verified-honor': 'Verified Honor',
    'credit-verified-honor': 'Credit Verified Honor',
    'executive-education-2u': 'Executive Education',
  };
  const courseEnrollment = camelCaseDict(enrollment);
  const renderBadge = () => {
    switch (courseEnrollment.courseRunStatus) {
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
        <h3 className="mb-1">{courseEnrollment.displayName}</h3>
        {renderBadge()}
      </Stack>
      <p className="small">{courseEnrollment.orgName} • {COURSE_TYPE_MAP[courseEnrollment.courseType]}</p>
      <Card.Footer className="p-0 justify-content-start">
        <Hyperlink
          className="btn btn-outline-primary"
          target="_blank"
          destination={`${getConfig().ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${courseEnrollment.courseKey}`}
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
  enrollment: PropTypes.shape({}).isRequired,
};

export default connect(mapStateToProps)(EnrollmentCard);
