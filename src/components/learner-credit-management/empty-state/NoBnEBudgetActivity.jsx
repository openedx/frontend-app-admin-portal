import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Button, Card, Col, Row,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';
import {
  useBudgetId,
  useEnterpriseGroupMembers,
  useIsLargeOrGreater,
  useSubsidyAccessPolicy,
} from '../data';
import nameYourMembers from '../assets/reading.svg';
import memberBrowse from '../assets/phoneScroll.svg';
import enrollAndSpend from '../assets/wallet.svg';

const NameYourMembersIllustration = (props) => (
  <img data-testid="name-your-members-illustration" src={nameYourMembers} alt="" {...props} />
);

const MemberBrowseIllustration = (props) => (
  <img data-testid="members-browse-illustration" src={memberBrowse} alt="" {...props} />
);

const EnrollAndSpendIllustration = (props) => (
  <img data-testid="enroll-and-spend-illustration" src={enrollAndSpend} alt="" {...props} />
);

const NoBnEBudgetActivity = ({ openInviteModal }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const groupId = subsidyAccessPolicy?.groupAssociations[0];
  const {
    groupMembersCount,
  } = useEnterpriseGroupMembers({
    policyUuid: subsidyAccessPolicy?.uuid,
    groupId,
    includeRemoved: false,
  });
  const isLargeOrGreater = useIsLargeOrGreater();

  return (
    <Card className="mb-4">
      <Card.Section className={classNames('text-center', { 'bg-light-300': isLargeOrGreater })}>
        <h3 className={classNames({ 'mb-4.5': isLargeOrGreater })}>
          No budget activity yet? Invite members to browse the catalog and enroll!
        </h3>
        {isLargeOrGreater && (
          <Row>
            <Col>
              <NameYourMembersIllustration />
            </Col>
            <Col>
              <MemberBrowseIllustration />
            </Col>
            <Col>
              <EnrollAndSpendIllustration />
            </Col>
          </Row>
        )}
      </Card.Section>
      <Card.Section className="text-center">
        <Row className={classNames({ 'mb-5': isLargeOrGreater })}>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <NameYourMembersIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">01</span>
              Name your members
            </h4>
            <span>
              Upload or enter email addresses to invite people to browse and enroll
              using this budget.
            </span>
          </Col>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <MemberBrowseIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">02</span>
              Members find the right course
            </h4>
            <span>
              Members can then browse the catalog associated with this budget and
              find a course that aligns with their interests.
            </span>
          </Col>
          <Col className="mb-5 mb-lg-0">
            {!isLargeOrGreater && <EnrollAndSpendIllustration className="mb-5" />}
            <h4>
              <span className="d-block text-brand mb-2">03</span>
              Members can enroll and spend
            </h4>
            <span>
              Members can enroll in courses, subject to any limits in this budget&apos;s
              settings. The deducted costs from this budget will be visible right here
              in your budget activity!
            </span>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              as={Link}
              onClick={openInviteModal}
            >
              {groupMembersCount > 0 ? 'Invite more members' : 'Get started'}
            </Button>
          </Col>
        </Row>
      </Card.Section>
    </Card>
  );
};

NoBnEBudgetActivity.propTypes = {
  openInviteModal: PropTypes.func.isRequired,
};

export default NoBnEBudgetActivity;
