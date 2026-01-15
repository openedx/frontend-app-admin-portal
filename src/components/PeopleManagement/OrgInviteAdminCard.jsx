import PropTypes from 'prop-types';
import {
  Avatar, Card, Col, Row,
} from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import AdminActionsMenu from './AdminActionsMenu';

const OrgInviteAdminCard = ({
  original, onRemoveAdmin,
  onCopyInviteLink,
}) => {
  const { enterpriseCustomerUser, inviteLink } = original;
  const {
    name, joinedOrg, email, role,
  } = enterpriseCustomerUser;

  return (
    <Card orientation="horizontal">
      <Card.Body>
        <Card.Section className="pb-1">
          <Row className="d-flex flex-row">
            <Col xs={2}>
              <Avatar size="lg" />
            </Col>
            <Col>
              <Row>
                <h3 className="pt-2">{name}</h3>
              </Row>
              <Row>
                <p>{email}</p>
              </Row>
            </Col>
            <Col>
              <h5 className="pt-2 text-uppercase">
                <FormattedMessage
                  id="adminPortal.peopleManagement.joinedOrg"
                  defaultMessage="Joined org"
                  description="Title for people management invite admin joined org date."
                />
              </h5>
              {joinedOrg}
            </Col>
            <Col>
              <h5 className="pt-2 text-uppercase">
                <FormattedMessage
                  id="adminPortal.peopleManagement.role"
                  defaultMessage="Role"
                  description="Title for people management invite admin Role status."
                />
              </h5>
              {role}
            </Col>
            <div>
              <AdminActionsMenu
                onRemove={() => onRemoveAdmin(original)}
                onCopy={() => onCopyInviteLink(inviteLink)}
              />
            </div>

          </Row>
        </Card.Section>
      </Card.Body>
    </Card>
  );
};

OrgInviteAdminCard.propTypes = {
  original: PropTypes.shape({
    enterpriseCustomerUser: PropTypes.shape({
      userId: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      joinedOrg: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }).isRequired,
    inviteLink: PropTypes.string,
  }).isRequired,
  onRemoveAdmin: PropTypes.func.isRequired,
  onCopyInviteLink: PropTypes.func.isRequired,
};

export default OrgInviteAdminCard;
