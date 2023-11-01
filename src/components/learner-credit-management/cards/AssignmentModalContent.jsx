import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Stack,
  Row,
  Col,
  Form,
  Card,
} from '@edx/paragon';

import BaseCourseCard from './BaseCourseCard';
import { formatPrice, useBudgetId, useSubsidyAccessPolicy } from '../data';
import { ImpactOnYourLearnerCreditBudget, ManagingThisAssignment, NextStepsForAssignedLearners } from './Collapsibles';

const AssignmentModalContent = ({ course }) => {
  const [emailAddresses, setEmailAddresses] = useState('');
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  return (
    <Container size="lg" className="py-3">
      <Stack gap={5}>
        <Row>
          <Col>
            <h3 className="mb-4">Use Learner Credit to assign this course</h3>
            <BaseCourseCard original={course} className="rounded-0 shadow-none" />
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={5}>
            <h4 className="mb-4">Assign to</h4>
            <Form.Group className="mb-5">
              <Form.Control
                as="textarea"
                value={emailAddresses}
                onChange={(e) => setEmailAddresses(e.target.value)}
                floatingLabel="Learner email addresses"
                rows={10}
                data-hj-suppress
              />
              <Form.Control.Feedback>
                To add more than one learner, enter one email address per line.
              </Form.Control.Feedback>
            </Form.Group>
            <h5 className="mb-3">How assigning this course works</h5>
            <Stack gap={1}>
              <NextStepsForAssignedLearners course={course} />
              <ImpactOnYourLearnerCreditBudget />
              <ManagingThisAssignment />
            </Stack>
          </Col>
          <Col xs={12} lg={{ span: 5, offset: 2 }}>
            <h4 className="mb-4">Pay by Learner Credit</h4>
            <h5 className="mb-4">Summary</h5>
            <Card className="rounded-0 shadow-none">
              <Card.Section>
                <div className="h4">You haven&apos;t entered any learners yet.</div>
                <span>Add learner emails to get started.</span>
              </Card.Section>
            </Card>
            <hr className="my-5" />
            <h5 className="mb-4">
              Learner Credit Budget: {subsidyAccessPolicy.displayName ?? 'Overview'}
            </h5>
            <Card className="rounded-0 shadow-none">
              <Card.Section className="d-flex justify-content-between">
                <div>Available balance</div>
                <div>{formatPrice(subsidyAccessPolicy.aggregates.spendAvailableUsd)}</div>
              </Card.Section>
            </Card>
          </Col>
        </Row>
      </Stack>
    </Container>
  );
};

AssignmentModalContent.propTypes = {
  course: PropTypes.shape().isRequired, // Pass-thru prop to `BaseCourseCard`
};

export default AssignmentModalContent;
