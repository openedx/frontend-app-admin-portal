import React, {
  useCallback, useState, useContext,
} from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import { connect } from 'react-redux';
import {
  Stepper, FullscreenModal, Button, StatefulButton,
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
import { CONTENT_HIGHLIGHTS_BASE_DATA, TRACK_EVENT_NAMES } from '../data/constants';

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
  const {
    enterpriseCuration: {
      enterpriseCuration: {
        uuid, title,
      },
    },
  } = useContext(EnterpriseAppContext);
  // uuid ,created, modified
  const history = useHistory();
  const { location } = history;
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [isPublishing, setIsPublishing] = useState(false);
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
    resetStepperModal();
    setCurrentStep(steps[0]);
  }, [resetStepperModal]);

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
  const handleNext = (e) => {
    const trackInfo = {
      ...CONTENT_HIGHLIGHTS_BASE_DATA(enterpriseId, title, uuid, e),
      stepperModal: {
        prev_step: currentStep,
        prev_step_position: steps.indexOf(currentStep) + 1,
        current_step: steps[steps.indexOf(currentStep) + 1],
        current_step_position: steps.indexOf(currentStep) + 2,
        highlight_title: highlightTitle,
        current_selected_row_ids: currentSelectedRowIds,
        current_selected_row_ids_length: Object.keys(currentSelectedRowIds).length,
        is_stepper_modal_open: isStepperModalOpen,
      },
    };
    if (currentStep === STEPPER_STEP_LABELS.CREATE_TITLE) {
      sendEnterpriseTrackEvent(
        enterpriseId,
        `${TRACK_EVENT_NAMES.STEPPER_STEP_CREATE_TITLE}.clicked`,
        trackInfo,
      );
    }
    if (currentStep === STEPPER_STEP_LABELS.SELECT_CONTENT) {
      sendEnterpriseTrackEvent(
        enterpriseId,
        `${TRACK_EVENT_NAMES.STEPPER_STEP_SELECT_CONTENT}.clicked`,
        trackInfo,
      );
    }
    setCurrentStep(steps[steps.indexOf(currentStep) + 1]);
  };
  const closeStepper = () => {
    closeStepperModal();
    const trackInfo = {
      ...CONTENT_HIGHLIGHTS_BASE_DATA(enterpriseId, title, uuid),
      stepperModal: {
        current_step: steps[steps.indexOf(currentStep)],
        current_step_position: steps.indexOf(currentStep) + 1,
        highlight_title: highlightTitle,
        current_selected_row_ids: currentSelectedRowIds,
        current_selected_row_ids_length: Object.keys(currentSelectedRowIds).length,
        is_stepper_modal_open: !isStepperModalOpen,
      },
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${TRACK_EVENT_NAMES.STEPPER_CLOSE_STEPPER_INCOMPLETE}.clicked`,
      trackInfo,
    );
  };
  return (
    <Stepper activeKey={currentStep}>
      <FullscreenModal
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
                onClick={() => closeStepperModal()}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={(event) => handleNext(event)}
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
                onClick={(event) => handleNext(event)}
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
  );
};

ContentHighlightStepper.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ContentHighlightStepper);
