import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';
import {
  ActionRow, Button, FullscreenModal, Hyperlink, StatefulButton, useToggle,
} from '@openedx/paragon';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { connect } from 'react-redux';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import EVENT_NAMES from '../../../eventTracking';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';
import {
  getAssignableCourseRuns,
  LEARNER_CREDIT_ROUTE,
  learnerCreditManagementQueryKeys,
  useBudgetId,
  useCatalogContainsContentItemsMultipleQueries,
  useEnterpriseFlexGroups,
  useSubsidyAccessPolicy,
} from '../data';
import AssignmentModalContent from './AssignmentModalContent';
import CreateAllocationErrorAlertModals from './CreateAllocationErrorAlertModals';
import NewAssignmentModalDropdown from './NewAssignmentModalDropdown';
import { ENTERPRISE_RESTRICTION_TYPE } from '../data/constants';

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
  const intl = useIntl();
  const navigate = useNavigate();
  const { enterpriseSlug, enterpriseAppPage } = useParams();
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();
  const [isOpen, open, close] = useToggle(false);
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [groupLearnerEmails, setGroupLearnerEmails] = useState([]);
  const [canAllocateAssignments, setCanAllocateAssignments] = useState(false);
  const [assignButtonState, setAssignButtonState] = useState('default');
  const [createAssignmentsErrorReason, setCreateAssignmentsErrorReason] = useState();
  const [assignmentRun, setAssignmentRun] = useState();
  const { data: enterpriseFlexGroups } = useEnterpriseFlexGroups(enterpriseId);
  const {
    successfulAssignmentToast: { displayToastForAssignmentAllocation },
  } = useContext(BudgetDetailPageContext);
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const [hasSelectedBulkGroupAssign, setHasSelectedBulkGroupAssign] = useState(false);
  const {
    subsidyUuid,
    assignmentConfiguration,
    isSubsidyActive,
    isAssignable,
    catalogUuid,
    aggregates,
    isLateRedemptionAllowed,
  } = subsidyAccessPolicy;
  const sharedEnterpriseTrackEventMetadata = {
    subsidyAccessPolicyId,
    catalogUuid,
    subsidyUuid,
    isSubsidyActive,
    isAssignable,
    aggregates,
    contentPriceCents: assignmentRun?.contentPrice ? assignmentRun.contentPrice * 100 : 0,
    parentContentKey: null,
    contentKey: course.key,
    courseUuid: course.uuid,
    assignmentConfiguration,
    isLateRedemptionAllowed,
  };
  const {
    dataByContentKey: catalogContainsRestrictedRunsData,
    isLoading: isLoadingCatalogContainsRestrictedRuns,
  } = useCatalogContainsContentItemsMultipleQueries(
    catalogUuid,
    course.courseRuns?.filter(
      // Pass only restricted runs.
      run => run.restrictionType === ENTERPRISE_RESTRICTION_TYPE,
    ).map(
      run => run.key,
    ),
  );
  const assignableCourseRuns = getAssignableCourseRuns({
    courseRuns: course.courseRuns,
    subsidyExpirationDatetime: subsidyAccessPolicy.subsidyExpirationDatetime,
    isLateRedemptionAllowed,
    catalogContainsRestrictedRunsData,
  });
  const { mutate } = useAllocateContentAssignments();
  const pathToActivityTab = generatePath(LEARNER_CREDIT_ROUTE, {
    enterpriseSlug, enterpriseAppPage, budgetId: subsidyAccessPolicyId, activeTabKey: 'activity',
  });
  const handleOpenAssignmentModal = (selectedCourseRun) => {
    setAssignmentRun(selectedCourseRun);
    if (!selectedCourseRun) {
      logError(`[handleOpenAssignmentModal]: Unable to open learner credit management allocation modal,
        selectedCourseRun: ${selectedCourseRun},
        parentContentKey: ${course.key},
        contentKey: ${selectedCourseRun.key},
        enterpriseUuid: ${enterpriseId},
        policyUuid: ${subsidyAccessPolicyId}`);
    }
    open();
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGN_COURSE,
      {
        ...sharedEnterpriseTrackEventMetadata,
        parentContentKey: course.key,
        contentKey: selectedCourseRun.key,
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

  const handleGroupSelectionsChanged = useCallback((
    value,
    { canAllocate = false } = {},
  ) => {
    setGroupLearnerEmails(value);
    setCanAllocateAssignments(canAllocate);
  }, []);

  const onSuccessEnterpriseTrackEvents = ({
    totalLearnersAllocated,
    totalLearnersAlreadyAllocated,
    response,
  }) => {
    const trackEventMetadata = {
      ...sharedEnterpriseTrackEventMetadata,
      parentContentKey: course.key,
      contentKey: assignmentRun.key,
      totalLearnersAllocated,
      totalLearnersAlreadyAllocated,
      response,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_ALLOCATION_LEARNER_ASSIGNMENT,
      trackEventMetadata,
    );
    if (hasSelectedBulkGroupAssign) {
      sendEnterpriseTrackEvent(
        enterpriseId,
        EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BULK_GROUP_ASSIGNMENT,
        trackEventMetadata,
      );
    }
  };
  const handleAllocateContentAssignments = () => {
    const payload = snakeCaseObject({
      contentPriceCents: assignmentRun.contentPrice * 100, // Convert to USD cents
      contentKey: assignmentRun.key,
      learnerEmails: [...learnerEmails, ...groupLearnerEmails],
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
        navigate(pathToActivityTab);
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
            contentKey: assignmentRun.key,
            parentContentKey: course.key,
            totalAllocatedLearners: learnerEmails.length + groupLearnerEmails.length,
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
      <NewAssignmentModalDropdown
        id={course.key}
        onClick={handleOpenAssignmentModal}
        courseRuns={assignableCourseRuns}
        isLoading={isLoadingCatalogContainsRestrictedRuns}
      >
        {children}
      </NewAssignmentModalDropdown>
      <FullscreenModal
        className="stepper-modal bg-light-200"
        title={intl.formatMessage({
          id: 'lcm.budget.detail.page.catalog.tab.assignment.modal.title',
          defaultMessage: 'Assign this course',
          description: 'Title for the assignment modal',
        })}
        isOpen={isOpen}
        isOverflowVisible={false}
        onClose={() => {
          handleCloseAssignmentModal();
          sendEnterpriseTrackEvent(
            enterpriseId,
            EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_MODAL_EXIT,
            {
              ...sharedEnterpriseTrackEventMetadata,
              contentKey: assignmentRun.key,
              parentContentKey: course.key,
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
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.help.center.cta"
                defaultMessage="Help Center: Course Assignments"
                description="Button text to open the help center for course assignments"
              />
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
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.assignment.modal.cancel.button"
                defaultMessage="Cancel"
                description="Button text to cancel the assignment modal"
              />
            </Button>
            <StatefulButton
              labels={{
                default:
                  intl.formatMessage({
                    id: 'lcm.budget.detail.page.catalog.tab.assignment.modal.assign.button',
                    defaultMessage: 'Assign',
                    description: 'Button text to assign course',
                  }),
                pending:
                  intl.formatMessage({
                    id: 'lcm.budget.detail.page.catalog.tab.assignment.modal.assign.button.pending',
                    defaultMessage: 'Assigning...',
                    description: 'Button text to indicate that the course is being assigned',
                  }),
                complete:
                  intl.formatMessage({
                    id: 'lcm.budget.detail.page.catalog.tab.assignment.modal.assign.button.complete',
                    defaultMessage: 'Assigned',
                    description: 'Button text to indicate that the course has been assigned',
                  }),
                error:
                  intl.formatMessage({
                    id: 'lcm.budget.detail.page.catalog.tab.assignment.modal.assign.button.error',
                    defaultMessage: 'Try again',
                    description: 'Button text to indicate that the assignment failed and to try again',
                  }),
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
          courseRun={assignmentRun}
          onEmailAddressesChange={handleEmailAddressesChanged}
          enterpriseFlexGroups={enterpriseFlexGroups}
          onGroupSelectionsChanged={handleGroupSelectionsChanged}
          setHasSelectedBulkGroupAssign={setHasSelectedBulkGroupAssign}
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
