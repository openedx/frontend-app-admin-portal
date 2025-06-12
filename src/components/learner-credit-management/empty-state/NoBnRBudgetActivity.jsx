import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Button, Card, Col, Row,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  useIsLargeOrGreater,
} from '../data';
import findCourse from '../assets/reading.svg';
import inviteLearners from '../assets/phoneScroll.svg';
import approveRequest from '../assets/wallet.svg';

const FindCourseIllustration = (props) => (
  <img data-testid="find-course-illustration" src={findCourse} alt="" {...props} />
);

const InviteLearnerIllustration = (props) => (
  <img data-testid="invite-learner-illustration" src={inviteLearners} alt="" {...props} />
);

const ApproveRequestIllustration = (props) => (
  <img data-testid="approve-request-illustration" src={approveRequest} alt="" {...props} />
);

const NoBnRBudgetActivity = ({ enterpriseSlug }) => {
  const isLargeOrGreater = useIsLargeOrGreater();

  return (
    <Card className="mb-4">
      <Card.Section className={classNames('text-center', { 'bg-light-300': isLargeOrGreater })}>
        <h3 className={classNames({ 'mb-4.5': isLargeOrGreater })}>
          No budget activity yet? Invite learners to browse the catalog and request content!
        </h3>
        {isLargeOrGreater && (
          <Row>
            <Col>
              <InviteLearnerIllustration />
            </Col>
            <Col>
              <FindCourseIllustration />
            </Col>
            <Col>
              <ApproveRequestIllustration />
            </Col>
          </Row>
        )}
      </Card.Section>
      <Card.Section className="text-center">
        <Row className={classNames({ 'mb-5': isLargeOrGreater })}>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <InviteLearnerIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">01</span>
              Invite learners
            </h4>
            <span>
              Use the Settings tab in this budget to select the authentication
              method that will allow learners to access the catalog.
            </span>
          </Col>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <FindCourseIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">02</span>
              Learners find the right course
            </h4>
            <span>
              Learners can then browse the catalog associated with this budget
              and request a course that aligns with their interests.
            </span>
          </Col>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <ApproveRequestIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">03</span>
              Approve requests
            </h4>
            <span>
              Once approved, the total cost of the requested course will be deducted
              from your budget, and you can track your spending right here!
            </span>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              as={Link}
              to={`/${enterpriseSlug}/admin/settings/access`}
            >
              Get started
            </Button>
          </Col>
        </Row>
      </Card.Section>
    </Card>
  );
};

NoBnRBudgetActivity.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(NoBnRBudgetActivity);
