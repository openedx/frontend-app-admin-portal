import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import {
  Container,
  Stack,
  Row,
  Col,
  Form,
  Card,
} from '@edx/paragon';
import isEmail from 'validator/lib/isEmail';

import BaseCourseCard from './BaseCourseCard';
import { formatPrice, useBudgetId, useSubsidyAccessPolicy } from '../data';
import { ImpactOnYourLearnerCreditBudget, ManagingThisAssignment, NextStepsForAssignedLearners } from './Collapsibles';
import AssignmentModalSummary from './AssignmentModalSummary';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY } from './data';

const isEmailAddressesInputValueValid = ({ learnerEmails, remainingBalance, contentPrice }) => {
  const invalidEmails = learnerEmails.filter((email) => !isEmail(email));
  const duplicateEmails = learnerEmails.filter((email, index) => learnerEmails.indexOf(email) !== index);
  const hasEnoughBalanceForAssignments = remainingBalance >= learnerEmails.length * contentPrice;
  const isValid = invalidEmails.length === 0 && duplicateEmails.length === 0 && hasEnoughBalanceForAssignments;
  return {
    isValid,
    invalidEmails,
    duplicateEmails,
    hasEnoughBalanceForAssignments,
  };
};

const AssignmentModalContent = ({ course, onEmailAddressesChange }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  const [learnerEmails, setLearnerEmails] = useState([]);
  const [emailAddressesInputValue, setEmailAddressesInputValue] = useState('');
  const [inputValidationErrorMessage, setInputValidationErrorMessage] = useState();

  const hasLearnerEmails = learnerEmails.length > 0;
  const hasValidLearnerEmails = hasLearnerEmails && !inputValidationErrorMessage;
  const spendAvailable = subsidyAccessPolicy.aggregates.spendAvailableUsd;
  const costToAssignLearners = learnerEmails.length * course.normalizedMetadata.contentPrice;
  const remainingBalanceAfterAssignment = spendAvailable - costToAssignLearners;

  const { contentPrice } = course.normalizedMetadata;

  const handleEmailAddressInputChange = (e) => {
    const inputValue = e.target.value;
    setEmailAddressesInputValue(inputValue);
  };

  const handleEmailAddressesChanged = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
    }
    const emails = value.split('\n').filter((email) => email.trim().length > 0);
    setLearnerEmails(emails);

    // Validate the emails textarea input
    const {
      isValid,
      invalidEmails,
      duplicateEmails,
      hasEnoughBalanceForAssignments,
    } = isEmailAddressesInputValueValid({
      learnerEmails: emails,
      contentPrice,
      remainingBalance: spendAvailable,
    });

    if (isValid) {
      setInputValidationErrorMessage(null);
      onEmailAddressesChange(emails);
    } else {
      let validationErrorMessage;
      if (invalidEmails.length > 0) {
        validationErrorMessage = `${invalidEmails[0]} is not a valid email.`;
      } else if (duplicateEmails.length > 0) {
        validationErrorMessage = `${duplicateEmails[0]} has been entered more than once.`;
      } else if (!hasEnoughBalanceForAssignments) {
        validationErrorMessage = `The total assignment cost exceeds your available Learner Credit budget balance of ${formatPrice(spendAvailable)}. Please remove learners and try again.`;
      }
      setInputValidationErrorMessage(validationErrorMessage);
      onEmailAddressesChange([]);
    }
  }, [onEmailAddressesChange, contentPrice, spendAvailable]);

  const debouncedHandleEmailAddressesChanged = useMemo(
    () => debounce(handleEmailAddressesChanged, EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY),
    [handleEmailAddressesChanged],
  );

  useEffect(() => {
    debouncedHandleEmailAddressesChanged(emailAddressesInputValue);
  }, [emailAddressesInputValue, debouncedHandleEmailAddressesChanged]);

  return (
    <Container size="lg" className="py-3">
      <Stack gap={5}>
        <Row>
          <Col>
            <h3 className="mb-4">Use Learner Credit to assign this course</h3>
            <BaseCourseCard original={course} cardClassName="shadow-none" />
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={5} className="mb-5 mb-lg-0">
            <h4 className="mb-4">Assign to</h4>
            <Form.Group className="mb-5">
              <Form.Control
                as="textarea"
                value={emailAddressesInputValue}
                onChange={handleEmailAddressInputChange}
                floatingLabel="Learner email addresses"
                rows={10}
                data-hj-suppress
              />
              {inputValidationErrorMessage ? (
                <Form.Control.Feedback type="invalid">
                  {inputValidationErrorMessage}
                </Form.Control.Feedback>
              ) : (
                <Form.Control.Feedback>
                  To add more than one learner, enter one email address per line.
                </Form.Control.Feedback>
              )}
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
            <AssignmentModalSummary
              course={course}
              learnerEmails={learnerEmails}
              inputValidationErrorMessage={inputValidationErrorMessage}
              hasEnoughBalanceForAssignments
            />
            <hr className="my-4" />
            <h5 className="mb-4">
              Learner Credit Budget: {subsidyAccessPolicy.displayName ?? 'Overview'}
            </h5>
            <Stack gap={2.5}>
              <Card className="rounded-0 shadow-none">
                <Card.Section className="py-2 small">
                  <Stack gap={2.5}>
                    <Stack direction="horizontal" className="justify-content-between">
                      <div>Available balance</div>
                      <div>{formatPrice(spendAvailable)}</div>
                    </Stack>
                    {hasValidLearnerEmails && (
                      <Stack direction="horizontal" className="justify-content-between">
                        <div>Total cost</div>
                        <div>-{formatPrice(costToAssignLearners)}</div>
                      </Stack>
                    )}
                  </Stack>
                </Card.Section>
              </Card>
              {hasValidLearnerEmails && (
                <Card className="rounded-0 shadow-none">
                  <Card.Section className="d-flex justify-content-between py-2">
                    <div>Remaining after assignment</div>
                    <div>{formatPrice(remainingBalanceAfterAssignment)}</div>
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
  course: PropTypes.shape().isRequired, // Pass-thru prop to `BaseCourseCard`
  onEmailAddressesChange: PropTypes.func.isRequired,
};

export default AssignmentModalContent;
