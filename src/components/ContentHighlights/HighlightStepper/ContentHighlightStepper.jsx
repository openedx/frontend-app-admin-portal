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
import { STEPPER_STEP_TEXT } from '../data/constants';

const STEPPER_STEP_LABELS = {
  CREATE_TITLE: 'Create a title',
  SELECT_CONTENT: 'Select content',
  CONFIRM_PUBLISH: 'Confirm and publish',
};

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
  const [isOpen, open, close] = useToggle(false);
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
    if (isOpen) {
      close();
    }
    resetStepperModal();
    setCurrentStep(steps[0]);
  }, [resetStepperModal, isOpen, close]);

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
    } catch (error) {
      logError(error);
    } finally {
      setIsPublishing(false);
    }
  };
  const closeStepper = () => {
    open();
  };

  /* Start beforeunload event */
  // This section triggers browser response to unsaved items when the stepper modal is open/active
  useEffect(() => {
    const preventUnload = () => {
      /* eslint-disable no-restricted-globals */
      /* Mandatory requirements to trigger response by browser, event.preventDefault && event.returnValue
      A return value is required to trigger the browser unsaved data blocking modal response */
      event.preventDefault();
      event.returnValue = 'Are you sure? Your data will not be saved.';
      /* eslint-enable no-restricted-globals */
    };

    /* Conditional MUST be set on event listener initialization.
    Failure to provide conditional will trigger browser event on
    all elements within ContentHighlightRoutes.jsx (essentially all of highlights) */
    if (isStepperModalOpen) {
      window.addEventListener('beforeunload', preventUnload);
    }
    /* Added safety to force remove the 'beforeunload' event on the window */
    return () => {
      window.removeEventListener('beforeunload', preventUnload);
    };
  }, [isStepperModalOpen]);
  /* End beforeunload event */

  return (
    <>
      <Stepper activeKey={currentStep}>
        <FullscreenModal
          id="test"
          title="New highlight"
          className="bg-light-200"
          isOpen={isStepperModalOpen}
          onClose={() => closeStepper()}
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
                  onClick={() => closeStepper()}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep(STEPPER_STEP_LABELS.SELECT_CONTENT)}
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
                  onClick={() => setCurrentStep(STEPPER_STEP_LABELS.CREATE_TITLE)}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep(STEPPER_STEP_LABELS.CONFIRM_PUBLISH)}
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
                  onClick={() => setCurrentStep(STEPPER_STEP_LABELS.SELECT_CONTENT)}
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
        isOpen={isOpen}
        onClose={close}
      >
        <p>
          {STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content}
        </p>
        <ActionRow>
          <Button variant="tertiary" onClick={close}>{STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel}</Button>
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
