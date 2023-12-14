import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Button, Card, Row, Col,
} from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { useIsLargeOrGreater, usePathToCatalogTab } from './data';
import nameYourLearners from './assets/nameYourLearners.svg';
import findTheRightCourse from './assets/findTheRightCourse.svg';
import confirmSpend from './assets/confirmSpend.svg';
import EVENT_NAMES from '../../eventTracking';

const FindTheRightCourseIllustration = (props) => (
  <img data-testid="find-the-right-course-illustration" src={findTheRightCourse} alt="" {...props} />
);

const NameYourLearnersIllustration = (props) => (
  <img data-testid="name-your-learners-illustration" src={nameYourLearners} alt="" {...props} />
);

const ConfirmSpendIllustration = (props) => (
  <img data-testid="confirm-spend-illustration" src={confirmSpend} alt="" {...props} />
);

const NoBudgetActivityEmptyState = ({ enterpriseId }) => {
  const pathToCatalogTab = usePathToCatalogTab();
  const isLargeOrGreater = useIsLargeOrGreater();

  return (
    <Card>
      <Card.Section className={classNames('text-center', { 'bg-light-300': isLargeOrGreater })}>
        <h3 className={classNames({ 'mb-4.5': isLargeOrGreater })}>
          No budget activity yet? Assign a course!
        </h3>
        {isLargeOrGreater && (
          <Row>
            <Col>
              <FindTheRightCourseIllustration />
            </Col>
            <Col>
              <NameYourLearnersIllustration />
            </Col>
            <Col>
              <ConfirmSpendIllustration />
            </Col>
          </Row>
        )}
      </Card.Section>
      <Card.Section className="text-center">
        <Row className={classNames({ 'mb-5': isLargeOrGreater })}>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <FindTheRightCourseIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">01</span>
              Find the right course
            </h4>
            <span>
              Check out your budget&apos;s catalog of courses and select the course you
              want to assign to learners.
            </span>
          </Col>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <NameYourLearnersIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">02</span>
              Name your learners
            </h4>
            <span>
              You will be prompted to enter email addresses for the learner or
              learners you want to assign.
            </span>
          </Col>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <ConfirmSpendIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">03</span>
              Confirm spend
            </h4>
            <span>
              Once confirmed, the total cost will be deducted from your budget,
              and you can track your spending right here!
            </span>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              as={Link}
              to={pathToCatalogTab}
              onClick={() => sendEnterpriseTrackEvent(
                enterpriseId,
                EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.EMPTY_STATE_CTA,
              )}
            >
              Get started
            </Button>
          </Col>
        </Row>
      </Card.Section>
    </Card>
  );
};

NoBudgetActivityEmptyState.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(NoBudgetActivityEmptyState);
