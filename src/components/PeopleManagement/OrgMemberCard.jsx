import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import {
  Avatar, Card, Col, Hyperlink, Row,
} from '@openedx/paragon';

import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';

const OrgMemberCard = ({ original }) => {
  const { enterpriseSlug } = useParams();
  const { enterpriseCustomerUser, enrollments } = original;
  const {
    name, joinedOrg, email, userId,
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
              <h5 className="pt-2 text-uppercase">Joined org</h5>
              {joinedOrg}
            </Col>
            <Col>
              <h5 className="pt-2 text-uppercase">Enrollments</h5>
              {enrollments}
            </Col>
            <Col>
              <Hyperlink
                className="pt-4"
                destination={`/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}/learner-detail/${userId}`}
                // onClick={handleOnViewCourseClick}
                // target="_blank"
                // isInline
              >
                View more
              </Hyperlink>
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
      userId: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      joinedOrg: PropTypes.string.isRequired,
    }),
    enrollments: PropTypes.number.isRequired,
  }),
};

export default OrgMemberCard;
