import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import {
  Card, Col, Container, Form, Row, Stack,
} from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { connect } from 'react-redux';
import BaseCourseCard from '../cards/BaseCourseCard';
import { formatPrice, useBudgetId, useSubsidyAccessPolicy } from '../data';
import AssignmentModalSummary from './AssignmentModalSummary';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY, isAssignEmailAddressesInputValueValid } from '../cards/data';
import AssignmentAllocationHelpCollapsibles from './AssignmentAllocationHelpCollapsibles';
import EVENT_NAMES from '../../../eventTracking';

const AssignmentModalContent = ({
  enterpriseId, course, courseRun, onEmailAddressesChange,
}) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const spendAvailable = subsidyAccessPolicy.aggregates.spendAvailableUsd;
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [emailAddressesInputValue, setEmailAddressesInputValue] = useState('');
  const [assignmentAllocationMetadata, setAssignmentAllocationMetadata] = useState({});
  const intl = useIntl();
  const { contentPrice } = courseRun;
  const handleEmailAddressInputChange = (e) => {
    const inputValue = e.target.value;
    setEmailAddressesInputValue(inputValue);
  };
  const handleEmailAddressesChanged = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }
    const emails = value.split('\n').filter((email) => email.trim().length > 0);
    setLearnerEmails(emails);
  }, [onEmailAddressesChange]);

  const debouncedHandleEmailAddressesChanged = useMemo(
    () => debounce(handleEmailAddressesChanged, EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY),
    [handleEmailAddressesChanged],
  );

  useEffect(() => {
    debouncedHandleEmailAddressesChanged(emailAddressesInputValue);
  }, [emailAddressesInputValue, debouncedHandleEmailAddressesChanged]);

  // Validate the learner emails from user input whenever it changes
  useEffect(() => {
    const allocationMetadata = isAssignEmailAddressesInputValueValid({
      learnerEmails,
      remainingBalance: spendAvailable,
      contentPrice,
    });
    setAssignmentAllocationMetadata(allocationMetadata);
    if (allocationMetadata.validationError?.reason) {
      sendEnterpriseTrackEvent(
        enterpriseId,
        EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_EMAIL_ADDRESS_VALIDATION,
        { validationErrorReason: allocationMetadata.validationError.reason },
      );
    }
    if (allocationMetadata.canAllocate) {
      onEmailAddressesChange(learnerEmails, { canAllocate: true });
    } else {
      onEmailAddressesChange([]);
    }
  }, [onEmailAddressesChange, learnerEmails, contentPrice, spendAvailable, enterpriseId]);

  return (
    <Container size="lg" className="py-3">
      <Stack gap={5}>
        <Row>
          <Col>
            <h3 className="mb-4">
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.assign.course.section.header"
                defaultMessage="Use Learner Credit to assign this course"
                description="Header for the section to assign a course to learners using learner credit."
              />
            </h3>
            <BaseCourseCard original={course} courseRun={courseRun} cardClassName="shadow-none" />
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={5} className="mb-5 mb-lg-0">
            <h4 className="mb-4">
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.assign.course.section.assign.to"
                defaultMessage="Assign to"
                description="Header for the section where we assign a course to learners"
              />
            </h4>
            <Form.Group className="mb-5">
              <Form.Control
                as="textarea"
                value={emailAddressesInputValue}
                onChange={handleEmailAddressInputChange}
                floatingLabel={intl.formatMessage({
                  id: 'lcm.budget.detail.page.catalog.tab.assign.course.section.assign.to.email.addresses',
                  defaultMessage: 'Learner email addresses',
                  description: 'Label for the input field where learner email addresses are entered',
                })}
                rows={10}
                data-hj-suppress
              />
              {assignmentAllocationMetadata.validationError ? (
                <Form.Control.Feedback type="invalid">
                  {assignmentAllocationMetadata.validationError.message}
                </Form.Control.Feedback>
              ) : (
                <Form.Control.Feedback>
                  <FormattedMessage
                    id="lcm.budget.detail.page.catalog.tab.assign.course.section.assign.to.email.addresses.help.text"
                    defaultMessage="To add more than one learner, enter one email address per line."
                    description="Help text for the input field if the user needs to add more than one learner."
                  />
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <h5 className="mb-3">
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.assign.course.section.how.assigning.works"
                defaultMessage="How assigning this course works"
                description="Header for the section that explains how assigning a course works"
              />
            </h5>
            <AssignmentAllocationHelpCollapsibles courseRun={courseRun} />
          </Col>
          <Col xs={12} lg={{ span: 5, offset: 2 }}>
            <h4 className="mb-4">
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.assign.course.section.pay.by.learner.credit"
                defaultMessage="Pay by Learner Credit"
                description="Header for the section where we pay for the course by learner credit."
              />
            </h4>
            <AssignmentModalSummary
              courseRun={courseRun}
              learnerEmails={learnerEmails}
              assignmentAllocationMetadata={assignmentAllocationMetadata}
            />
            <hr className="my-4" />
            <h5 className="mb-4">
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.assign.course.section.learner.credit.budget"
                defaultMessage="Learner Credit Budget: {subsidyAccessPolicyName}"
                description="Header for the section that explains the learner credit budget"
                values={{ subsidyAccessPolicyName: subsidyAccessPolicy.displayName ?? 'Overview' }}
              />
            </h5>
            <Stack gap={2.5}>
              <Card className="rounded-0 shadow-none">
                <Card.Section className="py-2 small">
                  <Stack gap={2.5}>
                    <Stack direction="horizontal" className="justify-content-between">
                      <div>
                        <FormattedMessage
                          id="lcm.budget.detail.page.catalog.tab.assign.course.section.available.balance"
                          defaultMessage="Available balance"
                          description="Label for the available balance in the learner credit budget"
                        />
                      </div>
                      <div>{formatPrice(spendAvailable)}</div>
                    </Stack>
                    {assignmentAllocationMetadata.canAllocate && (
                      <Stack direction="horizontal" className="justify-content-between">
                        <div>Total cost</div>
                        <div>-{formatPrice(assignmentAllocationMetadata.totalAssignmentCost)}</div>
                      </Stack>
                    )}
                  </Stack>
                </Card.Section>
              </Card>
              {assignmentAllocationMetadata.canAllocate && (
                <Card className="rounded-0 shadow-none">
                  <Card.Section className="d-flex justify-content-between py-2">
                    <div>
                      <FormattedMessage
                        id="lcm.budget.detail.page.catalog.tab.assign.course.section.remaining.after.assignment"
                        defaultMessage="Remaining after assignment"
                        description="Label for the remaining balance after assignment in the learner credit budget"
                      />
                    </div>
                    <div>{formatPrice(assignmentAllocationMetadata.remainingBalanceAfterAssignment)}</div>
                  </Card.Section>
                </Card>
              )}
            </Stack>
          </Col>
        </Row>
      </Stack>
    </Container>
  );
};

AssignmentModalContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  course: PropTypes.shape().isRequired, // Pass-thru prop to `BaseCourseCard`
  courseRun: PropTypes.shape({
    enrollBy: PropTypes.string,
    start: PropTypes.string,
    contentPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onEmailAddressesChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AssignmentModalContent);
