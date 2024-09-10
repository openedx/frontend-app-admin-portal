import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate, generatePath } from 'react-router-dom';
import {
  FullscreenModal,
  ActionRow,
  Button,
  useToggle,
  Hyperlink,
  StatefulButton,
} from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';
import { connect } from 'react-redux';
import { getConfig } from '@edx/frontend-platform/config';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import AssignmentModalContent from './AssignmentModalContent';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import {
  assignableCourseRuns,
  learnerCreditManagementQueryKeys,
  useBudgetId,
  useSubsidyAccessPolicy,
} from '../data';
import CreateAllocationErrorAlertModals from './CreateAllocationErrorAlertModals';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';
import EVENT_NAMES from '../../../eventTracking';
import { LEARNER_CREDIT_ROUTE } from '../constants';
import NewAssignmentModalDropdown from './NewAssignmentModalDropdown';

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
  const [canAllocateAssignments, setCanAllocateAssignments] = useState(false);
  const [assignButtonState, setAssignButtonState] = useState('default');
  const [createAssignmentsErrorReason, setCreateAssignmentsErrorReason] = useState();
  const [assignmentRun, setAssignmentRun] = useState();
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
    parentContentKey: null,
    contentKey: course.key,
    courseUuid: course.uuid,
    assignmentConfiguration,
  };
  const availableCourseRuns = assignableCourseRuns({
    courseRuns: course.courseRuns,
    subsidyExpirationDatetime: subsidyAccessPolicy.subsidyExpirationDatetime,
  });
  const { mutate } = useAllocateContentAssignments();
  const pathToActivityTab = generatePath(LEARNER_CREDIT_ROUTE, {
    enterpriseSlug, enterpriseAppPage, budgetId: subsidyAccessPolicyId, activeTabKey: 'activity',
  });

  const handleOpenAssignmentModal = (e) => {
    // Based on the user selection, we will extract the course run metadata from the key
    const selectedCourseRun = availableCourseRuns.find(({ key }) => key === e.target.closest('[id]').id);
    // If the selected course run is not found, we default to the advertised course run
    const courseRunMetadata = selectedCourseRun ?? course.advertisedCourseRun;
    setAssignmentRun(courseRunMetadata);
    open();
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGN_COURSE,
      {
        ...sharedEnterpriseTrackEventMetadata,
        parentContentKey: course.key,
        contentKey: courseRunMetadata.key,
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
  };
  const handleAllocateContentAssignments = () => {
    // If no assignmentRun key exist, fall back to the top level course key
    const payload = snakeCaseObject({
      contentPriceCents: course.normalizedMetadata.contentPrice * 100, // Convert to USD cents
      contentKey: assignmentRun.key,
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
      <NewAssignmentModalDropdown id={course.key} onClick={handleOpenAssignmentModal} courseRuns={availableCourseRuns}>
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
