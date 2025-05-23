import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import { connect } from 'react-redux';
import {
  ActionRow, AlertModal, Button, FullscreenModal, StatefulButton, Stepper, useToggle,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import HighlightStepperTitle from './HighlightStepperTitle';
import HighlightStepperSelectContent from './HighlightStepperSelectContent';
import HighlightStepperConfirmContent from './HighlightStepperConfirmContent';
import HighlightStepperFooterHelpLink from './HighlightStepperFooterHelpLink';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { enterpriseCurationActions } from '../../EnterpriseApp/data/enterpriseCurationReducer';
import { useContentHighlightsContext } from '../data/hooks';
import EVENT_NAMES from '../../../eventTracking';
import { STEPPER_STEP_LABELS } from '../data/constants';

const steps = [
  STEPPER_STEP_LABELS.CREATE_TITLE,
  STEPPER_STEP_LABELS.SELECT_CONTENT,
  STEPPER_STEP_LABELS.CONFIRM_PUBLISH,
];

/**
 * Stepper to support create user flow for a highlight set.
 */
const ContentHighlightStepper = ({ enterpriseId }) => {
  const intl = useIntl();
  const {
    enterpriseCuration: {
      dispatch: dispatchEnterpriseCuration,
    },
  } = useContext(EnterpriseAppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCloseAlertOpen, openCloseAlert, closeCloseAlert] = useToggle(false);
  const { resetStepperModal } = useContentHighlightsContext();
  const isStepperModalOpen = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.isOpen);
  const titleStepValidationError = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.titleStepValidationError,
  );
  const highlightTitle = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.highlightTitle,
  );
  const currentSelectedRowIds = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.currentSelectedRowIds,
  );

  const closeStepperModal = useCallback(() => {
    if (isCloseAlertOpen) {
      closeCloseAlert();
      sendEnterpriseTrackEvent(
        enterpriseId,
        `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_CLOSE_STEPPER_INCOMPLETE}`,
        {},
      );
    }
    resetStepperModal();
    setCurrentStep(steps[0]);
  }, [isCloseAlertOpen, resetStepperModal, closeCloseAlert, enterpriseId]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const newHighlightSet = {
        title: highlightTitle,
        isPublished: true,
        content_keys: Object.keys(currentSelectedRowIds).map(key => key.split(':')[1]),
      };
      const response = await EnterpriseCatalogApiService.createHighlightSet(enterpriseId, newHighlightSet);
      const result = camelCaseObject(response.data);
      const transformedHighlightSet = {
        cardImageUrl: result.cardImageUrl,
        isPublished: result.isPublished,
        title: result.title,
        uuid: result.uuid,
        highlightedContentUuids: result.highlightedContent || [],
      };
      dispatchEnterpriseCuration(enterpriseCurationActions.addHighlightSet(transformedHighlightSet));
      dispatchEnterpriseCuration(enterpriseCurationActions.setHighlightSetToast(transformedHighlightSet.uuid));
      navigate(location.pathname, {
        state: { addHighlightSet: true },
      });
      closeStepperModal();
      const handlePublishTrackEvent = () => {
        const trackInfo = {
          is_published: transformedHighlightSet.isPublished,
          highlight_set_uuid: transformedHighlightSet.uuid,
          highlighted_content_uuids: transformedHighlightSet.highlightedContentUuids.map(highlight => ({
            uuid: highlight.uuid,
            aggregationKey: highlight.aggregationKey,
          })),
        };
        sendEnterpriseTrackEvent(
          enterpriseId,
          `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_CONFIRM_CONTENT_PUBLISH}`,
          trackInfo,
        );
      };
      handlePublishTrackEvent();
    } catch (error) {
      logError(error);
    } finally {
      setIsPublishing(false);
    }
  };
  /**
   * Handles the navigation to the next step in the stepper from the createTitle step of the stepper.
   */
  const handleNavigateToSelectContent = () => {
    const trackInfo = {
      prev_step: currentStep,
      prev_step_position: steps.indexOf(currentStep) + 1,
      current_step: steps[steps.indexOf(currentStep) + 1],
      current_step_position: steps.indexOf(currentStep) + 2,
      highlight_title: highlightTitle,
      current_selected_row_ids: currentSelectedRowIds,
      current_selected_row_ids_length: Object.keys(currentSelectedRowIds).length,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_CREATE_TITLE_NEXT}`,
      trackInfo,
    );
    setCurrentStep(steps[steps.indexOf(currentStep) + 1]);
  };
  /**
   * Handles the navigation to the previous step in the stepper from the selectContent step of the stepper.
   */
  const handleNavigateFromSelectContent = () => {
    const trackInfo = {
      prev_step: currentStep,
      prev_step_position: steps.indexOf(currentStep) + 1,
      current_step: steps[steps.indexOf(currentStep) - 1],
      current_step_position: steps.indexOf(currentStep),
      highlight_title: highlightTitle,
      current_selected_row_ids: currentSelectedRowIds,
      current_selected_row_ids_length: Object.keys(currentSelectedRowIds).length,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_SELECT_CONTENT_BACK}`,
      trackInfo,
    );
    setCurrentStep(steps[steps.indexOf(currentStep) - 1]);
  };
  /**
   * Handles the navigation to the next step in the stepper from the selectContent step of the stepper.
   */
  const handleNavigateToConfirmContent = () => {
    const trackInfo = {
      prev_step: currentStep,
      prev_step_position: steps.indexOf(currentStep) + 1,
      current_step: steps[steps.indexOf(currentStep) + 1],
      current_step_position: steps.indexOf(currentStep) + 2,
      highlight_title: highlightTitle,
      current_selected_row_ids: currentSelectedRowIds,
      current_selected_row_ids_length: Object.keys(currentSelectedRowIds).length,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_SELECT_CONTENT_NEXT}`,
      trackInfo,
    );
    setCurrentStep(steps[steps.indexOf(currentStep) + 1]);
  };
  /**
   * Handles the navigation to the previous step in the stepper from the confirmContent step of the stepper.
   */
  const handleNavigateFromConfirmContent = () => {
    const trackInfo = {
      prev_step: currentStep,
      prev_step_position: steps.indexOf(currentStep) + 1,
      current_step: steps[steps.indexOf(currentStep) - 1],
      current_step_position: steps.indexOf(currentStep),
      highlight_title: highlightTitle,
      current_selected_row_ids: currentSelectedRowIds,
      current_selected_row_ids_length: Object.keys(currentSelectedRowIds).length,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_CONFIRM_CONTENT_BACK}`,
      trackInfo,
    );
    setCurrentStep(steps[steps.indexOf(currentStep) - 1]);
  };

  const openCloseConfirmationModal = () => {
    openCloseAlert();
    const trackInfo = {
      current_step: steps[steps.indexOf(currentStep)],
      current_step_position: steps.indexOf(currentStep) + 1,
      highlight_title: highlightTitle,
      current_selected_row_ids: currentSelectedRowIds,
      current_selected_row_ids_length: Object.keys(currentSelectedRowIds).length,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_CLOSE_HIGHLIGHT_MODAL}`,
      trackInfo,
    );
  };

  const cancelCloseModal = () => {
    closeCloseAlert();
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_CLOSE_HIGHLIGHT_MODAL_CANCEL}`,
      {},
    );
  };
  /**
   * This section triggers browser response to unsaved items when the stepper modal is open/active
   *
   * Mandatory requirements to trigger response by browser, event.preventDefault && event.returnValue
   * A return value is required to trigger the browser unsaved data blocking modal response
   *
   * Conditional MUST be set on event listener initialization.
   * Failure to provide conditional will trigger browser event on all elements
   * within ContentHighlightRoutes.jsx (essentially all of highlights)
   * */
  useEffect(() => {
    const preventUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure? Your data will not be saved.';
    };

    if (isStepperModalOpen) {
      global.addEventListener('beforeunload', preventUnload);
    }
    // Added safety to force remove the 'beforeunload' event on the global window
    return () => {
      global.removeEventListener('beforeunload', preventUnload);
    };
  }, [isStepperModalOpen]);

  return (
    <>
      <Stepper activeKey={currentStep}>
        <FullscreenModal
          title="New highlight"
          className="stepper-modal bg-light-200"
          isOpen={isStepperModalOpen}
          onClose={openCloseConfirmationModal}
          beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
          footerNode={(
            <>
              <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.CREATE_TITLE}>
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                {/* TODO: Eventually would need a check to see if the user has made any changes
                to the form before allowing them to close the modal without saving. */}
                <Button
                  variant="tertiary"
                  onClick={openCloseConfirmationModal}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNavigateToSelectContent}
                  disabled={!!titleStepValidationError || !highlightTitle}
                >
                  Next
                </Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.SELECT_CONTENT}>
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button
                  variant="tertiary"
                  onClick={handleNavigateFromSelectContent}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNavigateToConfirmContent}
                  disabled={Object.keys(currentSelectedRowIds).length === 0}
                >
                  Next
                </Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}>
                <HighlightStepperFooterHelpLink />
                <Stepper.ActionRow.Spacer />
                <Button
                  variant="tertiary"
                  onClick={handleNavigateFromConfirmContent}
                >
                  Back
                </Button>
                <StatefulButton
                  labels={{
                    default: 'Publish',
                    pending: 'Publishing...',
                  }}
                  variant="primary"
                  onClick={handlePublish}
                  state={isPublishing ? 'pending' : 'default'}
                />
              </Stepper.ActionRow>
            </>

          )}
          isOverflowVisible={false}
        >
          <Stepper.Step
            eventKey={STEPPER_STEP_LABELS.CREATE_TITLE}
            title={intl.formatMessage({
              id: 'highlights.new.highlights.stepper.step.labels.create.title',
              defaultMessage: 'Create a title',
              description: 'Message to create a title for administrators during new highlights creation',
            })}
            hasError={!!titleStepValidationError}
            description={titleStepValidationError || ''}
            index={steps.indexOf(STEPPER_STEP_LABELS.CREATE_TITLE)}
          >
            <HighlightStepperTitle />
          </Stepper.Step>

          <Stepper.Step
            eventKey={STEPPER_STEP_LABELS.SELECT_CONTENT}
            title={intl.formatMessage({
              id: 'highlights.new.highlights.stepper.step.labels.select.content',
              defaultMessage: 'Select content',
              description: 'Message to select content for administrators during new highlights creation',
            })}
            index={steps.indexOf(STEPPER_STEP_LABELS.SELECT_CONTENT)}
          >
            <HighlightStepperSelectContent />
          </Stepper.Step>

          <Stepper.Step
            eventKey={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}
            title={intl.formatMessage({
              id: 'highlights.new.highlights.stepper.step.labels.confirm.publish',
              defaultMessage: 'Confirm and publish',
              description: 'Publish confirmation message for administrators during new highlights creation',
            })}
            index={steps.indexOf(STEPPER_STEP_LABELS.CONFIRM_PUBLISH)}
          >
            <HighlightStepperConfirmContent />
          </Stepper.Step>
        </FullscreenModal>
      </Stepper>
      {/* Alert Modal for StepperModal Close Confirmation */}
      <AlertModal
        title={intl.formatMessage({
          id: 'highlights.new.highlights.stepper.step.alert.modal.title',
          defaultMessage: 'Lose Progress?',
          description: 'Alert modal title during new highlights creation',
        })}
        isOpen={isCloseAlertOpen}
        onClose={closeCloseAlert}
        isOverflowVisible={false}
      >
        <p>
          <FormattedMessage
            id="highlights.new.highlights.stepper.step.alert.modal.content"
            defaultMessage="If you exit now, any changes you have made will be lost."
            description="Alert modal message content during new highlights creation"
          />
        </p>
        <ActionRow>
          <Button variant="tertiary" onClick={cancelCloseModal}>
            <FormattedMessage
              id="highlights.new.highlights.stepper.step.alert.modal.buttons.cancel"
              defaultMessage="Cancel"
              description="Alert modal CTA button text during new highlights creation"
            />
          </Button>
          <Button variant="primary" onClick={closeStepperModal}>
            <FormattedMessage
              id="highlights.new.highlights.stepper.step.alert.modal.buttons.exit"
              defaultMessage="Exit"
              description="Alert modal CTA button text during new highlights creation"
            />
          </Button>
        </ActionRow>
      </AlertModal>
    </>
  );
};

ContentHighlightStepper.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ContentHighlightStepper);
