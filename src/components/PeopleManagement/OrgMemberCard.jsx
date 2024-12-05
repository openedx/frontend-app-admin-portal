import PropTypes from 'prop-types';

import {
  Avatar, Card, Col, Row,
} from '@openedx/paragon';

const OrgMemberCard = ({ original }) => {
  const { enterpriseCustomerUser, enrollments } = original;
  const { name, joinedOrg, email } = enterpriseCustomerUser;

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
              <h5 className="pt-2 text-uppercase">Joined org</h5>
              {joinedOrg}
            </Col>
            <Col>
              <h5 className="pt-2 text-uppercase">Enrollments</h5>
              {enrollments}
            </Col>
          </Row>
        </Card.Section>
      </Card.Body>
    </Card>
  );
};

OrgMemberCard.propTypes = {
  original: PropTypes.shape({
    enterpriseCustomerUser: PropTypes.shape({
      email: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      joinedOrg: PropTypes.string.isRequired,
    }),
    enrollments: PropTypes.number.isRequired,
  }),
};

export default OrgMemberCard;
