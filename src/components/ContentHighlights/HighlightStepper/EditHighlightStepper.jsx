import React, {
  useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import { connect } from 'react-redux';
import {
  ActionRow, AlertModal, Button, FullscreenModal, StatefulButton, Stepper, useToggle,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { useNavigate, useLocation } from 'react-router-dom';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import HighlightStepperSelectContent from './HighlightStepperSelectContent';
import EditHighlightStepperConfirmContent from './EditHighlightStepperConfirmContent';
import HighlightStepperFooterHelpLink from './HighlightStepperFooterHelpLink';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { useContentHighlightsContext } from '../data/hooks';
import { EDIT_STEPPER_STEP_LABELS } from '../data/constants';

const editSteps = [
  EDIT_STEPPER_STEP_LABELS.SELECT_CONTENT,
  EDIT_STEPPER_STEP_LABELS.CONFIRM_SAVE,
];

/**
 * Stepper to support edit user flow for adding/removing content in an existing highlight set.
 */
const EditHighlightStepper = ({ enterpriseId }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(editSteps[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCloseAlertOpen, openCloseAlert, closeCloseAlert] = useToggle(false);
  const { resetStepperModal } = useContentHighlightsContext();

  const isStepperModalOpen = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.isOpen && v[0].stepperModal.isEditMode,
  );
  const highlightSetUuid = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.highlightSetUuid,
  );
  const currentSelectedRowIds = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.currentSelectedRowIds,
  );
  const existingContentKeys = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.existingContentKeys,
  );
  // Removed unused highlightTitle variable

  const closeStepperModal = useCallback(() => {
    if (isCloseAlertOpen) {
      closeCloseAlert();
    }
    resetStepperModal();
    setCurrentStep(editSteps[0]);
  }, [isCloseAlertOpen, resetStepperModal, closeCloseAlert]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Determine selected aggregation keys
      const selectedKeys = Object.keys(currentSelectedRowIds);
      // New selections = keys not in existingContentKeys
      const newKeys = selectedKeys
        .filter(k => !existingContentKeys.includes(k))
        .map(key => key.split(':')[1]);
      // Removed existing content = existingContentKeys not in selectedKeys
      const removedKeys = existingContentKeys
        .filter(k => !selectedKeys.includes(k))
        .map(key => key.split(':')[1]);

      const payload = {};
      if (newKeys.length > 0) {
        payload.add_content_keys = newKeys;
      }
      if (removedKeys.length > 0) {
        payload.remove_content_keys = removedKeys;
      }

      await EnterpriseCatalogApiService.updateHighlightSet(highlightSetUuid, payload);

      navigate(location.pathname, {
        state: { highlightSetEdited: true },
      });
      closeStepperModal();
    } catch (error) {
      logError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigateToConfirm = () => {
    setCurrentStep(editSteps[1]);
  };

  const handleNavigateBackToSelect = () => {
    setCurrentStep(editSteps[0]);
  };

  const openCloseConfirmationModal = () => {
    openCloseAlert();
  };

  const cancelCloseModal = () => {
    closeCloseAlert();
  };

  useEffect(() => {
    const preventUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure? Your data will not be saved.';
    };

    if (isStepperModalOpen) {
      global.addEventListener('beforeunload', preventUnload);
    }
    return () => {
      global.removeEventListener('beforeunload', preventUnload);
    };
  }, [isStepperModalOpen]);

  return (
    <>
      <Stepper activeKey={currentStep}>
        <FullscreenModal
          title="Edit highlight"
          className="stepper-modal bg-light-200"
          isOpen={isStepperModalOpen}
          onClose={openCloseConfirmationModal}
          beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
          footerNode={(
            <>
              <Stepper.ActionRow eventKey={EDIT_STEPPER_STEP_LABELS.SELECT_CONTENT}>
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button
                  variant="tertiary"
                  onClick={openCloseConfirmationModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNavigateToConfirm}
                  disabled={Object.keys(currentSelectedRowIds).length === 0}
                >
                  Next
                </Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey={EDIT_STEPPER_STEP_LABELS.CONFIRM_SAVE}>
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button
                  variant="tertiary"
                  onClick={handleNavigateBackToSelect}
                >
                  Back
                </Button>
                <StatefulButton
                  labels={{
                    default: 'Save',
                    pending: 'Saving...',
                  }}
                  variant="primary"
                  onClick={handleSave}
                  state={isSaving ? 'pending' : 'default'}
                />
              </Stepper.ActionRow>
            </>
          )}
          isOverflowVisible={false}
        >
          <Stepper.Step
            eventKey={EDIT_STEPPER_STEP_LABELS.SELECT_CONTENT}
            title={intl.formatMessage({
              id: 'highlights.edit.stepper.step.labels.select.content',
              defaultMessage: 'Select content',
              description: 'Step label for selecting content in edit highlight stepper',
            })}
            index={0}
          >
            <HighlightStepperSelectContent />
          </Stepper.Step>

          <Stepper.Step
            eventKey={EDIT_STEPPER_STEP_LABELS.CONFIRM_SAVE}
            title={intl.formatMessage({
              id: 'highlights.edit.stepper.step.labels.confirm.save',
              defaultMessage: 'Confirm and save',
              description: 'Step label for confirming and saving in edit highlight stepper',
            })}
            index={1}
          >
            <EditHighlightStepperConfirmContent enterpriseId={enterpriseId} />
          </Stepper.Step>
        </FullscreenModal>
      </Stepper>
      <AlertModal
        title={intl.formatMessage({
          id: 'highlights.edit.stepper.alert.modal.title',
          defaultMessage: 'Lose Progress?',
          description: 'Alert modal title during edit highlights',
        })}
        isOpen={isCloseAlertOpen}
        onClose={closeCloseAlert}
        isOverflowVisible={false}
      >
        <p>
          <FormattedMessage
            id="highlights.edit.stepper.alert.modal.content"
            defaultMessage="If you exit now, any changes you have made will be lost."
            description="Alert modal message content during edit highlights"
          />
        </p>
        <ActionRow>
          <Button variant="tertiary" onClick={cancelCloseModal}>
            <FormattedMessage
              id="highlights.edit.stepper.alert.modal.buttons.cancel"
              defaultMessage="Cancel"
              description="Alert modal cancel button text during edit highlights"
            />
          </Button>
          <Button variant="primary" onClick={closeStepperModal}>
            <FormattedMessage
              id="highlights.edit.stepper.alert.modal.buttons.exit"
              defaultMessage="Exit"
              description="Alert modal exit button text during edit highlights"
            />
          </Button>
        </ActionRow>
      </AlertModal>
    </>
  );
};

EditHighlightStepper.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EditHighlightStepper);
