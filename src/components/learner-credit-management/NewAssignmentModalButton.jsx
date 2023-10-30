import React from 'react';
import PropTypes from 'prop-types';
import {
  FullscreenModal,
  ActionRow,
  Button,
  useToggle,
  Container,
  Hyperlink,
  Row,
  Col,
  Stack,
  Form,
  Collapsible,
  Card,
} from '@edx/paragon';
import BaseCourseCard from './cards/BaseCourseCard';
import { formatPrice, useBudgetId, useSubsidyAccessPolicy } from './data';

const NextStepsForAssignedLearners = () => (
  <Collapsible
    styling="basic"
    title={<h6 className="mb-0">Next steps for assigned learners</h6>}
    defaultOpen
  >
    <div className="bg-white">
      <ul className="x-small pl-4 py-2">
        <li>
          Learners will be notified of this course assignment by email.
        </li>
        <li>
          Learners must complete enrollment for this assignment by Jun 27, 2023. This deadline
          is calculated based on the course enrollment deadline or 90 days past the date of
          assignment, whichever is sooner.
        </li>
        <li>
          Learners will receive automated reminder emails every 10-15 days until the enrollment
          deadline is reached.
        </li>
      </ul>
    </div>
  </Collapsible>
);

const ImpactOnYourLearnerCreditBudget = () => (
  <Collapsible
    styling="basic"
    title={<h6 className="mb-0">Impact on your Learner Credit budget</h6>}
  >
    <div className="bg-white">
      <ul className="x-small pl-4 py-2">
        <li>
          The total assignment cost will be earmarked as &quot;assigned&quot; funds in your
          Learner Credit budget so you can&apos;t overspend.
        </li>
        <li>
          The course cost will automatically convert from &quot;assigned&quot; to &quot;spent&quot; funds
          when your learners complete registration.
        </li>
      </ul>
    </div>
  </Collapsible>
);

const ManagingThisAssignment = () => (
  <Collapsible
    styling="basic"
    title={<h6 className="mb-0">Managing this assignment</h6>}
  >
    <div className="bg-white">
      <ul className="x-small pl-4 py-2">
        <li>
          You will be able to monitor the status of this assignment by reviewing
          your Learner Credit Budget activity.
        </li>
        <li>
          You can cancel this course assignment or send email reminders any time
          before learners complete enrollment.
        </li>
      </ul>
    </div>
  </Collapsible>
);

const NewAssignmentModalButton = ({ course, children }) => {
  const [isOpen, open, close] = useToggle(false);
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  return (
    <>
      <Button onClick={open}>{children}</Button>
      <FullscreenModal
        className="bg-light-200 text-left"
        title="Assign this course"
        isOpen={isOpen}
        onClose={close}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" as={Hyperlink} destination="https://edx.org" target="_blank">
              Help Center: Course Assignments
            </Button>
            <ActionRow.Spacer />
            <Button variant="tertiary" onClick={close}>Cancel</Button>
            <Button>Assign</Button>
          </ActionRow>
        )}
      >
        <Container size="lg" className="py-3">
          <Stack gap={5}>
            <Row>
              <Col>
                <h3 className="mb-4">Use Learner Credit to assign this course</h3>
                <BaseCourseCard original={course} />
              </Col>
            </Row>
            <Row>
              <Col xs={12} lg={6}>
                <h4 className="mb-4">Assign to</h4>
                <Form.Group className="mb-5">
                  <Form.Control
                    as="textarea"
                    value=""
                    onChange={() => {}}
                    floatingLabel="Learner email addresses"
                    rows={10}
                  />
                  <Form.Control.Feedback>
                    To add more than one learner, enter one email address per line.
                  </Form.Control.Feedback>
                </Form.Group>
                <h5 className="mb-4">How assigning this course works</h5>
                <Stack gap={1}>
                  <NextStepsForAssignedLearners />
                  <ImpactOnYourLearnerCreditBudget />
                  <ManagingThisAssignment />
                </Stack>
              </Col>
              <Col xs={12} lg={6}>
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
      </FullscreenModal>
    </>
  );
};

NewAssignmentModalButton.propTypes = {
  course: PropTypes.shape().isRequired, // Pass-thru prop to `BaseCourseCard`
  children: PropTypes.node.isRequired, // Represents the button text
};

export default NewAssignmentModalButton;
