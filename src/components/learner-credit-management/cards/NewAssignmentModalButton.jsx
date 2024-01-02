import React, { useCallback, useContext, useState } from 'react';
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
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';
import { connect } from 'react-redux';
import { getConfig } from '@edx/frontend-platform/config';

import AssignmentModalContent from './AssignmentModalContent';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys, useBudgetId, useSubsidyAccessPolicy } from '../data';
import CreateAllocationErrorAlertModals from './CreateAllocationErrorAlertModals';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';
import EVENT_NAMES from '../../../eventTracking';

const useAllocateContentAssignments = () => useMutation({
  mutationFn: async ({
    subsidyAccessPolicyId,
    payload,
  }) => {
    const response = await EnterpriseAccessApiService.allocateContentAssignments(subsidyAccessPolicyId, payload);
    return camelCaseObject(response.data);
  },
});

const NewAssignmentModalButton = ({ enterpriseId, course, children }) => {
  const history = useHistory();
  const routeMatch = useRouteMatch();
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();
  const [isOpen, open, close] = useToggle(false);
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [canAllocateAssignments, setCanAllocateAssignments] = useState(false);
  const [assignButtonState, setAssignButtonState] = useState('default');
  const [createAssignmentsErrorReason, setCreateAssignmentsErrorReason] = useState();
  const {
    successfulAssignmentToast: { displayToastForAssignmentAllocation },
  } = useContext(BudgetDetailPageContext);
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    subsidyUuid, assignmentConfiguration, isSubsidyActive, isAssignable, catalogUuid, aggregates,
  } = subsidyAccessPolicy;
  const sharedEnterpriseTrackEventMetadata = {
    subsidyAccessPolicyId,
    catalogUuid,
    subsidyUuid,
    isSubsidyActive,
    isAssignable,
    aggregates,
    contentPriceCents: course.normalizedMetadata.contentPrice * 100,
    contentKey: course.key,
    courseUuid: course.uuid,
    assignmentConfiguration,
  };

  const { mutate } = useAllocateContentAssignments();
  const pathToActivityTab = generatePath(routeMatch.path, { budgetId: subsidyAccessPolicyId, activeTabKey: 'activity' });

  const handleOpenAssignmentModal = () => {
    open();
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGN_COURSE,
      {
        ...sharedEnterpriseTrackEventMetadata,
        isOpen: !isOpen,
      },
    );
  };
  const handleCloseAssignmentModal = () => {
    close();
    setAssignButtonState('default');
  };

  // Callback function for when emails are changed in the
  // child AssignmentModalContent component. Must be memoized as
  // the function is used within a `useEffect`'s dependency array.
  const handleEmailAddressesChanged = useCallback((
    value,
    { canAllocate = false } = {},
  ) => {
    setLearnerEmails(value);
    setCanAllocateAssignments(canAllocate);
  }, []);

  const onSuccessEnterpriseTrackEvents = ({
    totalLearnersAllocated,
    totalLearnersAlreadyAllocated,
    response,
  }) => {
    const trackEventMetadata = {
      ...sharedEnterpriseTrackEventMetadata,
      totalLearnersAllocated,
      totalLearnersAlreadyAllocated,
      response,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_ALLOCATION_LEARNER_ASSIGNMENT,
      trackEventMetadata,
    );
  };

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
    setCreateAssignmentsErrorReason(null);
    mutate(mutationArgs, {
      onSuccess: (res) => {
        setAssignButtonState('complete');
        // Ensure the budget and budgets queries are invalidated so that the relevant
        // queries become stale and refetches new updated data from the API.
        queryClient.invalidateQueries({
          queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
        });
        queryClient.invalidateQueries({
          queryKey: learnerCreditManagementQueryKeys.budgets(enterpriseId),
        });
        handleCloseAssignmentModal();
        const totalLearnersAllocated = res.created.length + res.updated.length;
        const totalLearnersAlreadyAllocated = res.noChange.length;
        onSuccessEnterpriseTrackEvents({
          totalLearnersAllocated,
          totalLearnersAlreadyAllocated,
          res,
        });
        displayToastForAssignmentAllocation({
          totalLearnersAllocated,
          totalLearnersAlreadyAllocated,
        });

        // Navigate to the activity tab
        history.push(pathToActivityTab);
      },
      onError: (err) => {
        const {
          httpErrorStatus,
          httpErrorResponseData,
        } = err.customAttributes;
        let errorReason = 'system_error';
        if (httpErrorStatus === 422) {
          const responseData = JSON.parse(httpErrorResponseData);
          errorReason = responseData[0].reason;
          setCreateAssignmentsErrorReason(errorReason);
        } else {
          setCreateAssignmentsErrorReason(errorReason);
        }
        setAssignButtonState('error');
        sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_ALLOCATION_ERROR,
          {
            ...sharedEnterpriseTrackEventMetadata,
            totalAllocatedLearners: learnerEmails.length,
            errorStatus: httpErrorStatus,
            errorReason,
            response: err,
          },
        );
      },
    });
  };

  return (
    <>
      <Button onClick={handleOpenAssignmentModal}>{children}</Button>
      <FullscreenModal
        className="stepper-modal bg-light-200"
        title="Assign this course"
        isOpen={isOpen}
        onClose={() => {
          handleCloseAssignmentModal();
          sendEnterpriseTrackEvent(
            enterpriseId,
            EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_MODAL_EXIT,
            {
              ...sharedEnterpriseTrackEventMetadata,
              assignButtonState,
            },
          );
        }}
        footerNode={(
          <ActionRow>
            <Button
              variant="tertiary"
              as={Hyperlink}
              onClick={() => sendEnterpriseTrackEvent(
                enterpriseId,
                EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_MODAL_HELP_CENTER,
                {
                  ...sharedEnterpriseTrackEventMetadata,
                  assignButtonState,
                },
              )}
              destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL}
              showLaunchIcon
              target="_blank"
            >
              Help Center: Course Assignments
            </Button>
            <ActionRow.Spacer />
            <Button
              variant="tertiary"
              onClick={() => {
                handleCloseAssignmentModal();
                sendEnterpriseTrackEvent(
                  enterpriseId,
                  EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_MODAL_CANCEL,
                  {
                    ...sharedEnterpriseTrackEventMetadata,
                    assignButtonState,
                  },
                );
              }}
            >
              Cancel
            </Button>
            <StatefulButton
              labels={{
                default: 'Assign',
                pending: 'Assigning...',
                complete: 'Assigned',
                error: 'Try again',
              }}
              variant="primary"
              state={assignButtonState}
              disabled={!canAllocateAssignments}
              onClick={handleAllocateContentAssignments}
            />
          </ActionRow>
        )}
      >
        <AssignmentModalContent
          course={course}
          onEmailAddressesChange={handleEmailAddressesChanged}
        />
      </FullscreenModal>
      <CreateAllocationErrorAlertModals
        errorReason={createAssignmentsErrorReason}
        retry={handleAllocateContentAssignments}
        closeAssignmentModal={handleCloseAssignmentModal}
      />
    </>
  );
};

NewAssignmentModalButton.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  course: PropTypes.shape().isRequired, // Pass-thru prop to `BaseCourseCard`
  children: PropTypes.node.isRequired, // Represents the button text
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(NewAssignmentModalButton);
