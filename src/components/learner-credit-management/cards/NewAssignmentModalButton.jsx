import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch, useHistory, generatePath } from 'react-router-dom';
import {
  FullscreenModal,
  ActionRow,
  Button,
  useToggle,
  Hyperlink,
  StatefulButton,
} from '@edx/paragon';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { snakeCaseObject } from '@edx/frontend-platform/utils';

import AssignmentModalContent from './AssignmentModalContent';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys, useBudgetId } from '../data';

const useAllocateContentAssignments = () => useMutation({
  mutationFn: async ({
    subsidyAccessPolicyId,
    payload,
  }) => EnterpriseAccessApiService.allocateContentAssignments(subsidyAccessPolicyId, payload),
});

const NewAssignmentModalButton = ({ course, children }) => {
  const history = useHistory();
  const routeMatch = useRouteMatch();
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const [isOpen, open, close] = useToggle(false);
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [assignButtonState, setAssignButtonState] = useState('default');

  const { mutate } = useAllocateContentAssignments();

  const pathToActivityTab = generatePath(routeMatch.path, { budgetId: subsidyAccessPolicyId, activeTabKey: 'activity' });

  const handleAllocateContentAssignments = () => {
    const payload = snakeCaseObject({
      contentPriceCents: course.normalizedMetadata.contentPrice * 100, // Convert to USD cents
      contentKey: course.key,
      learnerEmails,
    });
    const mutationArgs = {
      subsidyAccessPolicyId,
      payload,
    };
    setAssignButtonState('pending');
    mutate(mutationArgs, {
      onSuccess: () => {
        setAssignButtonState('complete');
        queryClient.invalidateQueries({
          queryKey: learnerCreditManagementQueryKeys.budgetActivityOverview(subsidyAccessPolicyId),
        });
        close();
        history.push(pathToActivityTab);
      },
      onError: () => {
        setAssignButtonState('error');
      },
    });
  };

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
            <StatefulButton
              labels={{
                default: 'Assign',
                pending: 'Assigning...',
                complete: 'Assigned',
                error: 'Try again',
              }}
              variant="primary"
              state={assignButtonState}
              onClick={handleAllocateContentAssignments}
            />
          </ActionRow>
        )}
      >
        <AssignmentModalContent course={course} onEmailAddressesChange={setLearnerEmails} />
      </FullscreenModal>
    </>
  );
};

NewAssignmentModalButton.propTypes = {
  course: PropTypes.shape().isRequired, // Pass-thru prop to `BaseCourseCard`
  children: PropTypes.node.isRequired, // Represents the button text
};

export default NewAssignmentModalButton;
