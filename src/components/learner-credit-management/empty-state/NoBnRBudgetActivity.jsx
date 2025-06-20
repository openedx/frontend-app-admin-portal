import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Button, Card, Col, Row,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  useIsLargeOrGreater,
} from '../data';
import findCourse from '../assets/reading.svg';
import inviteLearners from '../assets/phoneScroll.svg';
import approveRequest from '../assets/wallet.svg';
import messages from './messages';

const FindCourseIllustration = (props) => {
  const intl = useIntl();
  return (
    <img
      data-testid="find-course-illustration"
      src={findCourse}
      alt={intl.formatMessage(messages.findCourseIllustrationAlt)}
      {...props}
    />
  );
};

const InviteLearnerIllustration = (props) => {
  const intl = useIntl();
  return (
    <img
      data-testid="invite-learner-illustration"
      src={inviteLearners}
      alt={intl.formatMessage(messages.inviteLearnerIllustrationAlt)}
      {...props}
    />
  );
};

const ApproveRequestIllustration = (props) => {
  const intl = useIntl();
  return (
    <img
      data-testid="approve-request-illustration"
      src={approveRequest}
      alt={intl.formatMessage(messages.approveRequestIllustrationAlt)}
      {...props}
    />
  );
};

const NoBnRBudgetActivity = ({ enterpriseSlug }) => {
  const isLargeOrGreater = useIsLargeOrGreater();

  return (
    <Card className="mb-4">
      <Card.Section className={classNames('text-center', { 'bg-light-300': isLargeOrGreater })}>
        <h3 className={classNames({ 'mb-4.5': isLargeOrGreater })}>
          <FormattedMessage
            {...messages.noBudgetActivityTitle}
          />
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
              <span className="d-block text-brand mb-2">
                <FormattedMessage
                  {...messages.stepOne}
                />
              </span>
              <FormattedMessage
                {...messages.inviteLearners}
              />
            </h4>
            <span>
              <FormattedMessage
                {...messages.inviteLearnersDescription}
              />
            </span>
          </Col>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <FindCourseIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">
                <FormattedMessage
                  {...messages.stepTwo}
                />
              </span>
              <FormattedMessage
                {...messages.learnersFind}
              />
            </h4>
            <span>
              <FormattedMessage
                {...messages.learnersFindDescription}
              />
            </span>
          </Col>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <ApproveRequestIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">
                <FormattedMessage
                  {...messages.stepThree}
                />
              </span>
              <FormattedMessage
                {...messages.approveRequests}
              />
            </h4>
            <span>
              <FormattedMessage
                {...messages.approveRequestsDescription}
              />
            </span>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              as={Link}
              to={`/${enterpriseSlug}/admin/settings/access`}
            >
              <FormattedMessage
                {...messages.getStarted}
              />
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
