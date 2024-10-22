import { Avatar, Card, Col, Row } from '@openedx/paragon';

const OrgMemberCard = ({ original }) => {
  const { name, email, joinedOrg, enrollments } = original;

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
            <h5 className="pt-2 text-uppercase">Enrollments </h5>
            {enrollments}
          </Col>
        </Row>
        </Card.Section>
      </Card.Body>
    </Card>
  //    <Card
  //    className="mb-4 org-member-card"
  //    orientation="horizontal"
  //  >
  //    <Card.Body>
  //      <Card.Section>



  //          <Col>
  //            <h3>
  //              {name}
  //              {/* <FormattedMessage
  //                id="executive.education.external.course.enrollment.page.registration.summarycard.title"
  //                defaultMessage="Registration summary:"
  //                description="Title for the registration summary card on the executive education course enrollment page"
  //              /> */}
  //            </h3>
  //            <br />
  //            <p className="small font-weight-light text-gray-500 font-italic">
  //              {/* <FormattedMessage
  //                id="executive.education.external.course.enrollment.page.course"
  //                defaultMessage="This course is covered by the Learner Credit provided by your organization."
  //                description="Message about the course being covered by the Learner Credit"
  //              /> */}
  //              {email}
  //            </p>
  //          </Col>
  //          <Col xs={12} lg={{ span: 5, offset: 2 }}>
  //            <div className="registration-details rounded-lg border p-3">
  //              <Row>
  //                <Col xs={12} lg={{ span: 6, offset: 0 }} className="small font-weight-light text-gray-500 justify-content-start">
  //                  {/* <FormattedMessage
  //                    id="executive.education.external.course.enrollment.page.registration.total.message"
  //                    defaultMessage="Registration total:"
  //                    description="Total registration cost for the executive education course"
  //                  /> */}
  //                  {joinedOrg}
  //                </Col>
  //                <Col xs={12} lg={{ span: 6, offset: 0 }} className="justify-content-end">
  //                  <div className="d-flex justify-content-end small font-weight-light text-gray-500 mr-2.5">
  //                    {/* <FormattedMessage
  //                      id="executive.education.external.course.enrollment.page.registration.tax.included"
  //                      defaultMessage="Tax included"
  //                      description="Message about tax being included in the registration cost"
  //                    /> */}
  //                    {enrollments}
  //                  </div>
  //                </Col>
  //              </Row>
  //            </div>
  //          </Col>
  //      </Card.Section>
  //    </Card.Body>
  //  </Card>
  );
};

export default OrgMemberCard;