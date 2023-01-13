import React, {
  useCallback, useState, useContext, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import { connect } from 'react-redux';
import {
  Stepper,
  FullscreenModal,
  Button,
  StatefulButton,
  useToggle,
  AlertModal,
  ActionRow,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useHistory } from 'react-router-dom';
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
import { STEPPER_STEP_LABELS, STEPPER_STEP_TEXT } from '../data/constants';

const steps = [
  STEPPER_STEP_LABELS.CREATE_TITLE,
  STEPPER_STEP_LABELS.SELECT_CONTENT,
  STEPPER_STEP_LABELS.CONFIRM_PUBLISH,
];

/**
 * Stepper to support create user flow for a highlight set.
 */
const ContentHighlightStepper = ({ enterpriseId }) => {
  const {
    enterpriseCuration: {
      dispatch: dispatchEnterpriseCuration,
    },
  } = useContext(EnterpriseAppContext);
  const history = useHistory();
  const { location } = history;
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
      const trackInfo = {};
      sendEnterpriseTrackEvent(
        enterpriseId,
        `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_CLOSE_STEPPER_INCOMPLETE}`,
        trackInfo,
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
      dispatchEnterpriseCuration(enterpriseCurationActions.setHighlightToast(transformedHighlightSet.uuid));
      history.push(location.pathname, {
        addHighlightSet: true,
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
          `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_CONFIRM_CONTENT}.publish_button.clicked`,
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
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_CREATE_TITLE}.next.clicked`,
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
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_SELECT_CONTENT}.back.clicked`,
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
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_SELECT_CONTENT}.next.clicked`,
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
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_CONFIRM_CONTENT}.back.clicked`,
      trackInfo,
    );
    setCurrentStep(steps[steps.indexOf(currentStep) - 1]);
  };

  const openCloseStepper = () => {
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
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_CLOSE_HIGHLIGHT_MODAL}.clicked`,
      trackInfo,
    );
  };

  const cancelCloseModal = () => {
    closeCloseAlert();
    const trackInfo = {};
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_CLOSE_HIGHLIGHT_MODAL}.cancel.clicked`,
      trackInfo,
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
          className="bg-light-200"
          isOpen={isStepperModalOpen}
          onClose={openCloseStepper}
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
                  onClick={openCloseStepper}
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
        >
          <Stepper.Step
            eventKey={STEPPER_STEP_LABELS.CREATE_TITLE}
            title={STEPPER_STEP_LABELS.CREATE_TITLE}
            hasError={!!titleStepValidationError}
            description={titleStepValidationError || ''}
            index={steps.indexOf(STEPPER_STEP_LABELS.CREATE_TITLE)}
          >
            <HighlightStepperTitle />
          </Stepper.Step>

          <Stepper.Step
            eventKey={STEPPER_STEP_LABELS.SELECT_CONTENT}
            title={STEPPER_STEP_LABELS.SELECT_CONTENT}
            index={steps.indexOf(STEPPER_STEP_LABELS.SELECT_CONTENT)}
          >
            <HighlightStepperSelectContent enterpriseId={enterpriseId} />
          </Stepper.Step>

          <Stepper.Step
            eventKey={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}
            title={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}
            index={steps.indexOf(STEPPER_STEP_LABELS.CONFIRM_PUBLISH)}
          >
            <HighlightStepperConfirmContent />
          </Stepper.Step>
        </FullscreenModal>
      </Stepper>
      {/* Alert Modal for StepperModal Close Confirmation */}
      <AlertModal
        title={STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title}
        isOpen={isCloseAlertOpen}
        onClose={closeCloseAlert}
      >
        <p>
          {STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content}
        </p>
        <ActionRow>
          <Button variant="tertiary" onClick={cancelCloseModal}>{STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel}</Button>
          <Button variant="primary" onClick={closeStepperModal}>{STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit}</Button>
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
