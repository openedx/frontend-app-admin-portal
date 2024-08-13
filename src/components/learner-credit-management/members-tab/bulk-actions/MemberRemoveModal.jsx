import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow, Alert, Hyperlink, Icon, ModalDialog, Spinner, StatefulButton,
} from '@openedx/paragon';
import { RemoveCircle } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { snakeCaseObject } from '@edx/frontend-platform/utils';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useRequestState } from '../../../subscriptions/licenses/LicenseManagementModals/LicenseManagementModalHook';
import { configuration } from '../../../../config';
import LmsApiService from '../../../../data/services/LmsApiService';
import { useBudgetId, useSubsidyAccessPolicy } from '../../data';

/**
 * Returns StatefulButton labels
 * @param {number} totalToRemove
 * @returns {Object}
 */
const generateRemoveModalSubmitLabel = (intl, totalToRemove, isRemoveIndividualUser) => {
  let buttonNumberLabel = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.remove.all',
    defaultMessage: 'all',
    description: 'Button state when user click on remove button for all users',
  });

  if (isRemoveIndividualUser) {
    buttonNumberLabel = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.remove.individual',
      defaultMessage: 'member',
      description: 'Button state when user click on remove button for individual user',
    });
  } else if (Number.isFinite(totalToRemove)) {
    buttonNumberLabel = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.remove.number',
      defaultMessage: '({totalToRemove})',
      description: 'Button state when user click on remove button',
    }, { totalToRemove });
  }

  return {
    default: intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.remove',
      defaultMessage: 'Remove {buttonNumberLabel}',
      description: 'Button state when user click on remove button',
    }, { buttonNumberLabel }),
    pending: intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.removing',
      defaultMessage: 'Removing {buttonNumberLabel}',
      description: 'Button state when removing action is in pending state',
    }, { buttonNumberLabel }),
    complete: intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.done',
      defaultMessage: 'Done',
      description: 'Button state when removing action is completed',
    }),
    error: intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.retry',
      defaultMessage: 'Retry remove {buttonNumberLabel}',
      description: 'Button state when removing action is failed',
    }, { buttonNumberLabel }),
  };
};

const MemberRemoveModal = ({
  isOpen,
  onClose,
  onSuccess,
  usersToRemove,
  removeAllUsers,
  totalToRemove,
  groupUuid,
  isRemoveIndividualUser,
}) => {
  const intl = useIntl();
  const [requestState, setRequestState, initialRequestState] = useRequestState(isOpen);
  const buttonLabels = generateRemoveModalSubmitLabel(intl, totalToRemove, isRemoveIndividualUser);
  const title = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.title',
    defaultMessage: 'Remove member{memberCount, plural, one {} other {s}}?',
  }, { memberCount: removeAllUsers || totalToRemove > 1 ? 2 : 1 });

  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const handleSubmit = useCallback(async () => {
    setRequestState({ ...initialRequestState, loading: true });
    const makeRequest = () => {
      const baseRequestBody = { catalogUuid: subsidyAccessPolicy.catalogUuid };
      let requestBody;
      if (removeAllUsers) {
        requestBody = snakeCaseObject({ remove_all: true, ...baseRequestBody });
      } else {
        const userEmailsToRemove = usersToRemove.map((user) => user.original.memberDetails.userEmail);
        requestBody = snakeCaseObject({ learnerEmails: userEmailsToRemove, ...baseRequestBody });
      }
      return LmsApiService.removeEnterpriseLearnersFromGroup(groupUuid, requestBody);
    };
    try {
      const response = await makeRequest();
      setRequestState({ ...initialRequestState, success: true });
      onSuccess(response);
    } catch (error) {
      logError(error);
      setRequestState({ ...initialRequestState, error });
    }
  }, [
    usersToRemove,
    initialRequestState,
    onSuccess,
    setRequestState,
    groupUuid,
    subsidyAccessPolicy,
    removeAllUsers,
  ]);

  const handleClose = () => {
    if (!requestState.loading) {
      onClose();
    }
  };

  const getRemoveButtonState = () => {
    if (requestState.error) {
      return 'error';
    }
    if (requestState.loading) {
      return 'pending';
    }
    if (requestState.success) {
      return 'complete';
    }
    return 'default';
  };

  return (
    <ModalDialog
      title={title}
      isOpen={isOpen}
      onClose={handleClose}
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {title}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {requestState.error
          && (
            <Alert variant="danger">
              <p>
                <FormattedMessage
                  id="learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.error"
                  defaultMessage="There was an error with your request. Please try again."
                  description="Error message when removing members"
                />
              </p>
              <p>
                <FormattedMessage
                  id="learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.errorContactSupport"
                  defaultMessage="If the error persists, <a>contact customer support</a>."
                  description="Error message when removing members"
                  values={{
                    // eslint-disable-next-line react/no-unstable-nested-components
                    a: (chunks) => (
                      <Hyperlink destination={configuration.ENTERPRISE_SUPPORT_URL}>
                        {chunks}
                      </Hyperlink>
                    ),
                  }}
                />
              </p>
            </Alert>
          )}
        <p>
          <FormattedMessage
            id="learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.description"
            defaultMessage="This action cannot be undone."
            description="Description for the remove member modal"
          />
        </p>
        <p>
          <FormattedMessage
            id="learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.description2"
            defaultMessage="The members will be notified and immediately lose access to browse the catalog
              and enroll using this budget’s available Learner Credit balance. Removal will
              not impact any current or past enrollments the members may have originated through this budget."
            description="Description for the remove member modal"
          />
        </p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage
              id="learnerCreditManagement.budgetDetail.membersTab.membersTable.removeModal.cancel"
              defaultMessage="Go back"
              description="Cancel button text for the remove member modal"
            />
          </ModalDialog.CloseButton>
          <StatefulButton
            state={getRemoveButtonState()}
            variant="danger"
            onClick={handleSubmit}
            disabled={(!removeAllUsers && usersToRemove.length < 1)}
            labels={buttonLabels}
            data-testid="modal-remove-button"
            icons={{
              default: <Icon src={RemoveCircle} />,
              pending: <Spinner animation="border" variant="light" size="sm" />,
            }}
            disabledStates={['pending', 'complete']}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

MemberRemoveModal.defaultProps = {
  removeAllUsers: false,
  totalToRemove: -1,
  isRemoveIndividualUser: false,
};

MemberRemoveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  /** Function executed after successful remind request resolved */
  onSuccess: PropTypes.func.isRequired,
  usersToRemove: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
    }),
  ).isRequired,
  removeAllUsers: PropTypes.bool,
  totalToRemove: PropTypes.number,
  groupUuid: PropTypes.string.isRequired,
  isRemoveIndividualUser: PropTypes.bool,
};

export default MemberRemoveModal;
